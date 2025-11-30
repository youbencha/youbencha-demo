# youbencha-demo
Test cases to demonstrate an iterative workflow with youBencha

Uses your current CLI context. Currently there are only examples for Copilot CLI and Claude Code.

## Setup Instructions
- npm install youbencha -g

## Review Step 1
- Review the evaluators set in the test case configuration, testcase-iteration-1.yaml. If you were starting from scratch and following a test driven development approach, these evaluators would be written first.
- Review the generic-agent.md file that will be the base agent to perform the task (prompt). The starting point the agent will use is this repo (https://github.com/youbencha/hello-world.git) which contains a simple hello world readme.md file. The prompt is not detailed and very ambiguous.

## Run Step 1
- yb run -c ./copilot/iteration-1/testcase-iteration-1.yaml

## Review Step 1 Results
- The results.json/artifacts will be located in the .youbencha-workspace folder with a new folder created for each run. You can find the newly created snake game in the src-modified folder. Try to run the game by opening the index.html file. Review the results of the evaluators in the results.json file. The evaluations should fail. Review the assertion results where 1 is passing and 0 is failing

```json
{
    "evaluator": "agentic-judge-error-handling",
    "status": "failed",
    "metrics": {
    "agent_type": "copilot-cli",
    "agent_duration_ms": 26653
    },
    "message": "No error handling implemented. The code lacks try-catch blocks, has no error messages, and includes no error logging. Operations like localStorage.getItem() and DOM element access proceed without error handling, which could cause silent failures or uncaught exceptions.",
    "duration_ms": 26865,
    "timestamp": "2025-11-30T16:28:45.435Z",
    "assertions": {
    "has_try_catch": 0,
    "error_messages_clear": 0,
    "errors_logged": 0
    }
},
{
    "evaluator": "agentic-judge-documentation",
    "status": "failed",
    "metrics": {
    "agent_type": "copilot-cli",
    "agent_duration_ms": 37406
    },
    "message": "No functions have JSDoc or formal documentation. The game.js file contains 11 functions (drawGame, clearCanvas, drawSnake, drawFood, moveSnake, generateFood, checkCollision, checkFoodCollision, changeDirection, startGame, endGame) with no JSDoc comments. Only minimal inline comments exist. Error types and scenarios are not documented - collision detection exists in checkCollision() but lacks documentation explaining error conditions or handling strategies.",
    "duration_ms": 37582,
    "timestamp": "2025-11-30T16:28:56.152Z",
    "assertions": {
    "functions_documented": 0,
    "error_types_documented": 0
    }
},
{
    "evaluator": "agentic-judge-best-practices",
    "status": "passed",
    "metrics": {
    "agent_type": "copilot-cli",
    "agent_duration_ms": 36650
    },
    "message": "All criteria met. No console.log statements found in any files. The code appropriately handles error conditions through game state management (endGame()) rather than throwing errors, which is the correct pattern for a game application. Code follows consistent conventions with camelCase naming, 4-space indentation, clear function separation, and organized structure across all files.",
    "duration_ms": 36897,
    "timestamp": "2025-11-30T16:28:55.467Z",
    "assertions": {
    "no_console_log": 1,
    "proper_error_types": 1,
    "follows_conventions": 1
    }
}
```

## Review Step 2 Modified Agent
- The step 2 agent improves the agent instructions, specifically stating to implement error handling and follow doc best pratices

## Run Step 2
- yb run -c ./copilot/iteration-2/testcase-iteration-2.yaml

## Review Step 2 Results
- The prompt specifically states to implement error handling and follow doc best practices