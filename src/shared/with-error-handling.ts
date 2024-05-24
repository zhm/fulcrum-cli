type CommandFunction = (...args: any[]) => Promise<void>;

export default function withErrorHandling(fn: CommandFunction): CommandFunction {
  return async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (error) {
      console.error('error', error.message);
    }
  };
}
