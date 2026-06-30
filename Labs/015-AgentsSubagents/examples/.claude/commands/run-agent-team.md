Run an agent team in this order:

1. Use the `researcher` subagent to identify where to implement the request.
2. Use the `implementer` subagent to perform the change.
3. Use the `reviewer` subagent to review the resulting diff.
4. Return a final summary with:
   - Files changed
   - Risks found
   - Suggested next step

Task to execute:
$ARGUMENTS
