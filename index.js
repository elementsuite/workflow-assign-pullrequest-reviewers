const core = require('@actions/core');
const github = require('@actions/github');

var requestReview = function(client, pullRequest, reviewers, fallbacks, author) {
  if (fallbacks.includes(author)) {
    fallbacks.splice( fallbacks.indexOf(author), 1);
  }
  if (reviewers.includes(author)) {
    reviewers.splice( reviewers.indexOf(author), 1);
    reviewers.concat(fallbacks);
  }
  client.pulls.createReviewRequest({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    reviewers: reviewers
  });
}

async function run() {
  try {
    const token = core.getInput('github-token');
    const titleRegex = core.getInput('title-regex');
    const groups = JSON.parse(core.getInput('groups'));
    const titleSplitCharacter = core.getInput('title-split-chara');
    const client = new github.GitHub(token);
    const payload = github.context.payload;
    const pullRequest = github.context.issue;
    const title = payload.pull_request.title;
    const author = payload.pull_request.user.login;

    if (!new RegExp(titleRegex).test(title)) {
      return;
    }

    var titleElements = title.split(titleSplitCharacter);
    var module = titleElements[0];
    var type = titleElements[1];

    var reviewers = groups[module][type];

    let files = await client.pulls.listFiles({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number
    });

    if (files && files.data.length) {
      for (var i = 0; i < files.data.length; i++) {
        var file = files.data[i];
        var extension = file.filename.substr(file.filename.lastIndexOf('.') + 1);
        if (['less', 'css', 'sass'].includes(extension)) {
          reviewers.concat(groups.designers);
        }
      }
    }

    if (reviewers && reviewers.length) {
      requestReview(client, pullRequest, reviewers, groups.default, author)
    }
  } catch (error) {
    console.error(error.message);
  }
}

run();
