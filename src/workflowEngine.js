export function getPath(source, path) {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce((value, key) => {
    if (value == null) {
      return undefined;
    }
    return value[key];
  }, source);
}

export function interpolateTemplate(template, context) {
  return String(template || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const value = getPath(context, path);
    return value == null ? "" : String(value);
  });
}

export function evaluateCondition(condition, context) {
  const left = getPath(context, condition.left);
  const right = condition.right;

  switch (condition.operator) {
    case ">":
      return Number(left) > Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<":
      return Number(left) < Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case "===":
      return left === right;
    case "!==":
      return left !== right;
    case "==":
      return left == right;
    case "!=":
      return left != right;
    case "contains":
      return String(left || "").includes(String(right));
    default:
      throw new Error(`Unsupported condition operator: ${condition.operator}`);
  }
}

function createLog(node, status, detail = {}) {
  return {
    nodeId: node.id,
    type: node.type,
    label: node.label,
    status,
    timestamp: new Date().toISOString(),
    ...detail,
  };
}

function shouldRunNode(node, context) {
  if (!node.config?.when) {
    return true;
  }

  return context[node.config.when]?.result === true;
}

export async function runWorkflow(workflow, options = {}) {
  const context = { ...(options.initialContext || {}) };
  const logs = [];
  const services = options.services || {};

  for (const node of workflow) {
    if (!shouldRunNode(node, context)) {
      logs.push(createLog(node, "skipped", { reason: "Condition was false" }));
      continue;
    }

    try {
      if (node.type === "manualTrigger") {
        const output = { triggeredAt: new Date().toISOString() };
        context.trigger = output;
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      if (node.type === "weatherApi") {
        if (!services.fetchWeather) {
          throw new Error("Missing fetchWeather service");
        }

        const output = await services.fetchWeather({
          cityId: node.config?.cityId,
          city: context.city,
        });
        context.weather = output;
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      if (node.type === "httpRequest") {
        if (!services.httpRequest) {
          throw new Error("Missing httpRequest service");
        }

        const output = await services.httpRequest(node.config || {}, context);
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      if (node.type === "aiOfficeTask") {
        if (!services.officeAI) {
          throw new Error("Missing officeAI service");
        }

        const output = await services.officeAI(node.config || {}, context);
        context.ai = output;
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      if (node.type === "condition") {
        const result = evaluateCondition(node.config.condition, context);
        const output = { result };
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      if (node.type === "notify") {
        const message = interpolateTemplate(node.config?.message, context);
        if (services.notify) {
          await services.notify(message, context);
        }
        const output = { message };
        context[node.id] = output;
        logs.push(createLog(node, "success", { output }));
        continue;
      }

      throw new Error(`Unsupported node type: ${node.type}`);
    } catch (error) {
      logs.push(
        createLog(node, "error", {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      throw Object.assign(error, { context, logs });
    }
  }

  return { context, logs };
}
