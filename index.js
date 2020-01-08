const core = require('@actions/core');
const github = require('@actions/github');

var requestReview = function(client, pullRequest, reviewers, fallbacks) {
  if (fallbacks.includes(pullRequest.owner)) {
    fallbacks.splice( fallbacks.indexOf(pullRequest.owner), 1);
  }
  if (reviewers.includes(pullRequest.owner)) {
    reviewers.splice( reviewers.indexOf(pullRequest.owner), 1);
    reviewers.concat(fallbacks);
  }
  client.pulls.createReviewRequest({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    reviewers: reviewers
  });
}

try {
  const token = core.getInput('github-token');
  const titleRegex = core.getInput('title-regex');
  const groups = JSON.parse(core.getInput('groups'));
  const titleSplitCharacter = core.getInput('title-split-chara');
  const client = new github.GitHub(token);
  const payload = github.context.payload;
  const pullRequest = github.context.issue;
  const title = payload.pull_request.title;

  console.log("payload", payload);

  if (!new RegExp(titleRegex).test(title)) {
    return;
  }

  var titleElements = title.split(titleSplitCharacter);
  var module = titleElements[0];
  var type = titleElements[1];

  var reviewers = groups[module][type];

  if (reviewers && reviewers.length) {
    requestReview(client, pullRequest, reviewers, groups.default)
  }
} catch (error) {
  console.error(error.message);
}
