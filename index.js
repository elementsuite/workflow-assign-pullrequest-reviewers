const core = require('@actions/core');
const github = require('@actions/github');

try {
  const token = core.getInput('github-token');
  const groups = core.getInput('groups');
  console.log('groups', groups);
} catch (error) {
  console.error(error.message);
}
