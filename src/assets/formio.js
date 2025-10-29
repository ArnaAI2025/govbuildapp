window.onload = function () {
  Formio.createForm(document.getElementById("formio"), window.formioConfig, {
    saveDraft: true,
  }).then(function (form) {
    let grid = [];
    form.everyComponent((component) => {
      if (
        component.component.type === "address" &&
        component.component.provider === "google"
      ) {
        let myComponent = form.getComponent(component.component.key);
        myComponent.component["enableManualMode"] = true;
      }

      if (component.component.dataSrc === "url") {
        let myComponent = form.getComponent(component.component.key);
        myComponent.component["description"] =
          "That it will only work online and the form will need to be saved as a draft";
        myComponent.redraw();
      }

      if (component.component.type === "file") {
        let myComponent = form.getComponent(component.component.key);
        component.disabled = true;
        myComponent.component["description"] =
          "<p style='color: #ff0000'>While in offline mode you will upload files in the next step.</p>";
        myComponent.redraw();
      }

      if (component.component.type === "datagrid") {
        let myComponent = form.getComponent(component.component.key);
        if (myComponent.components.length === 0) {
          if (myComponent.component.components[0].type === "columns") {
            let col = myComponent.component.components[0].columns;
            for (let j = 0; j < col.length; j++) {
              let newComp = col[j].components;
              if (newComp[0].type === "file") {
                grid.push(newComp[0].label);
                window.ReactNativeWebView.postMessage(
                  `datagrid*${myComponent.key}*${newComp[0].key}*${
                    newComp[0].validate?.required || false
                  }*${newComp[0].multiple || false}*${newComp[0].label}*${
                    newComp[0].filePattern || ""
                  }`
                );
              }
            }
          }
        } else {
          myComponent.components.forEach((item) => {
            if (item.type === "file") {
              grid.push(item.label);
              window.ReactNativeWebView.postMessage(
                `datagrid*${myComponent.key}*${item.key}*${
                  item.validate?.required || false
                }*${item.multiple || false}*${item.label}*${
                  item.filePattern || ""
                }`
              );
            }

            if (item.component.columns) {
              item.component.columns.forEach((item1) => {
                item1.components.forEach((item2) => {
                  if (item2.type === "file") {
                    window.ReactNativeWebView.postMessage(
                      `datagrid*${component.component.key}*${item2.key}*${
                        item2.validate?.required || false
                      }*${item2.multiple || false}*${item2.label}*${
                        item2.filePattern || ""
                      }`
                    );
                  }
                });
              });
            }
          });
        }
      }

      if (
        component.component.type === "file" &&
        component.component.input === true
      ) {
        let myComponent = form.getComponent(component.component.key);
        let condition =
          myComponent.component.conditional?.show != null &&
          myComponent.component.conditional?.when != null &&
          myComponent.component.conditional?.eq !== ""
            ? JSON.stringify(myComponent.component.conditional)
            : "";
        if (!grid.includes(component.component.label)) {
          window.ReactNativeWebView.postMessage(
            `component*${component.component.key}*${
              component.component.label
            }*${component.component.validate?.required || false}*${condition}*${
              myComponent.component.customConditional || false
            }*${component.component.multiple || false}*${
              component.component.filePattern || ""
            }`
          );
        }
      }
    });

    form.on("redraw", () => {
      form.everyComponent((component) => {
        if (component.component.type === "datagrid") {
          component.components.forEach((item) => {
            if (item.component.type === "file") {
              // Handle file components
            }
            if (item.component.columns) {
              item.component.columns.forEach((item1) => {
                item1.components.forEach((item2) => {
                  if (item2.type === "file") {
                    // Handle file components
                  }
                });
              });
            }
          });
        }

        if (component.component.type === "file") {
          let myComponent = form.getComponent(component.component.key);
          if (
            !myComponent.component.conditional ||
            myComponent.component.conditional.when == null
          ) {
            component.disabled = true;
            myComponent.component["description"] =
              "<p style='color: #ff0000'>While in offline mode you will upload files in the next step.</p>";
            myComponent.redraw();
          }
        }
      });
    });

    form.on("submit", (submission) => {
      const jsonData = JSON.stringify(submission);
      const jsonGrid = JSON.stringify(submission.data);
      const messageType = submission.state === "draft" ? "isDraft" : "submit";
      window.ReactNativeWebView.postMessage(
        `${messageType}*${jsonData}*${jsonGrid}`
      );
    });
  });
};
