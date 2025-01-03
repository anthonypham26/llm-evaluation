// index.ts
import { PrismaClient } from '@prisma/client';
import express from 'express';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(express.json());

//create a new experiment
app.post('/experiments', async (req, res) => {
  try {
    const { name, systemPrompt, llmModel, testCaseIds } = req.body;

    const newExperiment = await prisma.experiment.create({
      data: {
        name,
        systemPrompt,
        llmModel,
        testCases: {
          create: testCaseIds.map((testCaseId: number) => ({
            testCase: {
              connect: { id: testCaseId },
            },
          })),
        },
      },
      include: {
        testCases: {
          include: {
            testCase: true,
          }
        },
      },
    });

    res.status(201).json(newExperiment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

//get all experiments
app.get('/experiments', async (req, res) => {
  try {
    const experiments = await prisma.experiment.findMany({
      include: {
        testCases: {
          include: {
            testCase: true,
          },
        },
        experimentRuns: {
          include: {
            testResults: {
              include: {
                testCase: true
              }
            }
          }
        }
      },
    });
    res.json(experiments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

//create a new test case
app.post('/test-cases', async (req: any, res: any) => {
  try {
    const { userMessage, expectedOutput } = req.body;

    if (!userMessage || !expectedOutput) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTestCase = await prisma.testCase.create({
      data: {
        userMessage,
        expectedOutput,
      },
    });

    res.status(201).json(newTestCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
});

// Get all test cases
app.get('/test-cases', async (req, res) => {
  try {
    const testCases = await prisma.testCase.findMany();
    res.json(testCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

// Run an experiment
app.post('/experiments/:id/run', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Fetch the experiment and its associated test cases
    const experiment = await prisma.experiment.findUnique({
      where: { id: parseInt(id) },
      include: {
        testCases: {
          include: {
            testCase: true,
          },
        },
      },
    });

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    const experimentRun = await prisma.experimentRun.create({
      data: {
        experimentId: experiment.id,
        llmModel: experiment.llmModel, 
      },
    });

    const testResults = [];

    for (const { testCase } of experiment.testCases) {

      const { actualOutput, responseTime } = await interactWithLLM(
        experiment.systemPrompt,
        testCase.userMessage,
        experiment.llmModel
      );

      const score = await gradeResponse(
        testCase.expectedOutput,
        actualOutput
      );

      const testResult = await prisma.testResult.create({
        data: {
          experimentRunId: experimentRun.id,
          testCaseId: testCase.id,
          actualOutput,
          score,
          responseTime,
        },
      });
      testResults.push(testResult);
    }

    res.status(200).json({
      message: 'Experiment run completed',
      runId: experimentRun.id,
      results: testResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to run experiment' });
  }
});

//get experiment_run results
app.get('/experiment-runs/:runId/results', async (req: any, res: any) => {
  try {
    const { runId } = req.params;

    const experimentRun = await prisma.experimentRun.findUnique({
      where: { id: parseInt(runId) },
      include: {
        testResults: {
          include: {
            testCase: true,
          },
        },
      },
    });

    if (!experimentRun) {
      return res.status(404).json({ error: 'Experiment run not found' });
    }

    res.json(experimentRun.testResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch experiment run results' });
  }
});

async function interactWithLLM(
  systemPrompt: string,
  userMessage: string,
  llmModel: string
): Promise<{ actualOutput: string; responseTime: number }> {
  console.log('Using LLM:', llmModel);
  console.log('System Prompt:', systemPrompt);
  console.log('User Message:', userMessage);

  const startTime = Date.now();
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: llmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const endTime = Date.now();
    const response = chatCompletion.choices[0]?.message?.content || '';

    return {
      actualOutput: response,
      responseTime: endTime - startTime,
    };
  } catch (error) {
    console.error('Error interacting with LLM:', error);
    return {
      actualOutput: 'Error generating response',
      responseTime: 0,
    };
  }
}

//grader
async function gradeResponse(
  expectedOutput: string,
  actualOutput: string
): Promise<number> {
  try {
    const prompt = `
      You are a grading assistant. Please compare the expected output to the actual output and determine if they are semantically similar. 
      Assign a score from 0.0 (not similar at all) to 1.0 (very similar).

      Expected Output: ${expectedOutput}
      Actual Output: ${actualOutput}

      Provide only the score as a single number.
    `;

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
    });

    const scoreString = response.choices[0]?.message?.content || "";
    const score = parseFloat(scoreString);

    return isNaN(score) ? 0.0 : score;
  } catch (error) {
    console.error("Error during response grading:", error);
    return 0.0;
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});