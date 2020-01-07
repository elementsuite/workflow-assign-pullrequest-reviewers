const core = require('@actions/core');
const github = require('@actions/github');

var requestReview = function(client, pullRequest, reviewers) {
  client.pulls.createReviewRequest({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    reviewers: reviewers
  });
}

try {
  const token = core.getInput('github-token');
  const groups = JSON.parse(core.getInput('groups'));
  const titleRegex = core.getInput('title-regex');
  const titleSplitCharacter = core.getInput('title-split-chara');
  const payload = github.context.payload;
  const title = payload.pull_request.title;
  const client = new github.GitHub(token);
  const pullRequest = github.context.issue;

  if (!new RegExp(titleRegex).test(title)) {
    return;
  }

  var titleElements = title.split(titleSplitCharacter);
  var module = titleElements[0];
  var type = titleElements[1];

  var reviewers = groups[module][type];

  if (reviewers && reviewers.length) {
    addReview(client, pullRequest, reviewers)
  }


  console.log('groups', JSON.parse(groups));
} catch (error) {
  console.error(error.message);
}
