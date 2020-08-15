# Treenee

Treenee is a web application made for presenting simple decision trees to humans; each "node" of the tree is supposed to show the user a prompt with several possible options to select from as the next step: upon selection, Treenee will render the corresponding node until the end of the tree, when a "next node" cannot be selected anymore.

The last node of the tree also doesn't contain any further options but usually shows a page with further instructions, a result, or anything you can think of it may come as a "final decision", so to speak.

A demo server with the default installation is available at [Treenee.com](https://treenee.com).

## Features (and limits)

- no database needed; all tree definitions are just YAML file (one file for each tree, in case you need to serve more than one)
- no login, no registration; access to the application is always anonymous (see below for a discussion about [security](#security))
- trees can be made "private" with a code, to make them accessible only to people who know that code. The code is requested in the home page
- each answer can be given a "value" which is added until the end so that each user can get a "score" (read more in the [Score section](#score) below)
- optionally, a person can only visit a node once (option `trackVisits`, which defaults to `false`); going back and forth the nodes with the browser's capabilities is fully handled
- many validating checks are performed on the inputs to ensure the trees are consistent and robust
- a cookie is used to maintain track of the session data
- the JSON schema for the tree definition is provided in `tree-schema.json`
- the JSON schema for the settings is provided in `settings-schema.json`
- (optional) graph visualization of each tree is implemented using (using [Mermaid](https://mermaid-js.github.io/))

## Installation (for development)

`npm install` and then `npm start`. You can avoid tree validation (useful during the authoring of a new tree), running `npm run start-dev` (or directly using the `--build-mode` command line option).

In case you want to just validate the JSON trees definition and not run the server, you can run `node index.js --dry-run`.

The default installation comes with a (silly) example tree in `./trees/example`.

Trees are automatically loaded from the trees directory; you can _exclude_ trees to be read, using the specific settings option.

## Deployment (for production)

Since this is just a nodejs application, I think my opinion here is as good as yours.

You can create a static working copy of the website by just running `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent http://localhost:3000` (if you are running the server on port 3000).

If you are interested in working with statically generated files, please take a look at the (unsupported) script `./scripts/task-build.sh` for inspiration.

## Configuration

You probably want to be able to configure some of the aspects of the application; to do so you just need to create a file called `settings.json` in the root of the application (where the main index.js is located) or you can specify a custom location of the file with the `-s` server setting. Run the server with the `--sample-settings` switch to dump a template file to be used (you can leave the comments inside).

Each configuration option meaning is described in the settings.json template file.

If you want to create a sample tree, run `node index --sample-tree` to output a YAML that you can use as a starting point.

## Translations

All the strings used by the Treenee user interface can be translated (or just changed
from their default value). To do so, use the `settings.json` file (see above the [Configuration](#configuration) section), and work on the `strings` object in it.

Hint: for the sake of self-documenting, and to simplify debugging translation issues, each string in the final HTML is wrapped within a `<span>` with a class having the same name then the key used for translation.

## Security

Treenee doesn't have any concept of "user" and it always runs anonimously; one (crypted) session cookie is used to just keep track of the scores during a tree navigation.

Since Treenee is not supposed to be directly exposed to the internet but to run behind a nginx server or similar, if you need to run Treenee in a public space with a bit of authentication my suggestion is to use a simple [basic authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication) managed by the web server itself.

The same applies of course for TLS: the Treenee server itself only speaks HTTP. If you need HTTPS you need to terminate it to the server running in front of it.

## Score

Admittedly, "scoring" is quite useless as it is implemented right now. If you add a "value" to each option of a nod, then Treenee will sum all the score until the end of the navigation. The final score is then showed on any final page.

## Look customization

There are not many options to customize how Treenee looks, unfortunately. It is planned to have some kind of "theme" support in the future but for the moment all you can do is to hack something directly into the `./public/css` directory.

To avoid potential issues during future updates, Treenee will try loading a `./public/css/custom.css` file which is _not_ provided by the default installation, which means that if you want to customize the look and feel, just put your css in that file.
