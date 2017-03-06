'use babel';

import { CompositeDisposable } from 'atom';
import questions from 'atom-questions';
import fs from 'fs-plus';
import path from 'path';
import dust from 'dustjs-linkedin';

export default {
  yetiPath: path.join(atom.configDirPath, '/yetiman/'),
  binds: {},
  templates: {},
  compiles: {},
  ask() {
    let q = [{
      type: "input",
      message: "What's your name?",
      name: "name"
    }, {
      type: "input",
      message: "What are your plans?",
      name: "plans",
      default: "Do awesome stuff"
    }];
    return questions.ask(q);
  },
  bind(name, obj) {
    this.binds[name] = () => {
      if (!this.compiles[name]) {
        fs.readFile(
          path.join(this.yetiPath, '/templates', obj.tplFile),
          "utf-8",
          (err, data) => {
            if (!err) {
              var compiled = dust.compile(data, name);
              dust.loadSource(compiled);
            }
          }
        );
      }
      return questions.ask(obj.questions)
      .then((a) => {
        return new Promise((resolve, reject) => {
          dust.render(name, a, function(err, out) {
            if (err) return reject(err);
            resolve(out);
          })
        })
      })
    }
  },
  run(name) {
    return this.binds[name]();
  },
  reload() {
    let files = fs.readdirSync(this.yetiPath);
    for(let file of files) {
      let filepath = path.join(this.yetiPath, file);
      let stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        continue;
      }
      if (file.indexOf('.js') > 0) {
        require(filepath)(this);
      }
    }
  },
  scaffold() {
    var isDir = fs.isDirectorySync(path.join(atom.configDirPath, '/yetiman'));
    if (!isDir) {
      fs.mkdirSync(this.yetiPath);
      fs.mkdirSync(path.join(this.yetiPath, '/templates'));
      if (!fs.existsSync(path.join(this.yetiPath, 'hello.js'))) {
        var contents = [
          "'use babel';\n\nexport default (yetiman) => {",
          "  yetiman.bind('hello', {",
          "    questions: [{",
          "      type: 'input',",
          "      name: 'name',",
          "      default: 'John',",
          "      message: 'What\\'s your name?',",
          "    }],",
          "    tplFile: 'hello.hbs'",
          "    //which is equivalent to ",
          "    //tpl: 'Hello {name}'",
          "  })",
          "}"
        ].join("\n");
        fs.writeFileSync(
          path.join(this.yetiPath, 'hello.js'),
          contents
        );
        fs.writeFileSync(
          path.join(this.yetiPath, '/templates', 'hello.hbs'),
          "Hello {{name}}"
        );
      }
    }
  },

  /*
  atomYetimanCoreView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomYetimanCoreView = new AtomYetimanCoreView(state.atomYetimanCoreViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomYetimanCoreView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-yetiman-core:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomYetimanCoreView.destroy();
  },

  serialize() {
    return {
      atomYetimanCoreViewState: this.atomYetimanCoreView.serialize()
    };
  },

  toggle() {
    console.log('AtomYetimanCore was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }
  */
};
