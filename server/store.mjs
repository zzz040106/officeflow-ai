import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const EMPTY_DB = {
  workflows: [],
  runs: [],
};

export class JsonStore {
  constructor({ dataDir }) {
    this.dataDir = dataDir;
    this.filePath = join(dataDir, "db.json");
  }

  async read() {
    await mkdir(this.dataDir, { recursive: true });

    try {
      return JSON.parse(await readFile(this.filePath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        return structuredClone(EMPTY_DB);
      }
      throw error;
    }
  }

  async write(data) {
    await mkdir(this.dataDir, { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  async listWorkflows() {
    return (await this.read()).workflows;
  }

  async saveWorkflow(workflow) {
    const data = await this.read();
    const existingIndex = data.workflows.findIndex((item) => item.id === workflow.id);
    const nextWorkflow = {
      ...workflow,
      id: workflow.id || `workflow-${Date.now()}`,
    };

    if (existingIndex >= 0) {
      data.workflows[existingIndex] = nextWorkflow;
    } else {
      data.workflows.push(nextWorkflow);
    }

    await this.write(data);
    return nextWorkflow;
  }

  async deleteWorkflow(workflowId) {
    const data = await this.read();
    const previousLength = data.workflows.length;
    data.workflows = data.workflows.filter((item) => item.id !== workflowId);
    const deleted = data.workflows.length !== previousLength;
    if (deleted) {
      await this.write(data);
    }
    return deleted;
  }

  async addRun(run) {
    const data = await this.read();
    const nextRun = {
      ...run,
      id: run.id || `run-${Date.now()}`,
      createdAt: run.createdAt || new Date().toISOString(),
    };
    data.runs.unshift(nextRun);
    data.runs = data.runs.slice(0, 100);
    await this.write(data);
    return nextRun;
  }

  async listRuns(workflowId) {
    const runs = (await this.read()).runs;
    return workflowId ? runs.filter((run) => run.workflowId === workflowId) : runs;
  }
}
