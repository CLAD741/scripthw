const fs = require("fs");
const { exec } = require("child_process");
let pruebasautomatizadas = {
    id: "backstop_default",
    viewports: [{
        label: "default",
        width: 800,
        height: 600,
    }, ],
    onBeforeScript: "puppet/onBefore.js",
    onReadyScript: "puppet/onReady.js",
    scenarios: [],
    paths: {
        bitmaps_reference: "backstop_data/bitmaps_reference",
        bitmaps_test: "backstop_data/bitmaps_test",
        engine_scripts: "backstop_data/engine_scripts",
        html_report: "backstop_data/html_report",
        ci_report: "backstop_data/ci_report",
    },
    report: ["browser"],
    engine: "puppeteer",
    engineOptions: {
        args: ["--no-sandbox"],
    },
    asyncCaptureLimit: 50,
    asyncCompareLimit: 50,
    debug: false,
    debugWindow: false,
};

async function getFiles(dir) {
    let lista = [];
    fs.readdir(dir, (err, files) => {
        if (err) console.log(err);
        else {
            files.forEach((file) => {
                lista.push(file);
            });
        }
    });
    return lista;
}

function ejecutarBackstop() {
    exec("backstop test", (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

function ejecutarBackstopApprove() {
    exec("backstop approve", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
async function iniciarScript() {
    console.log("Leyendo archivos...");
    let arrayv1 = await getFiles("./v1");
    let arrayv2 = await getFiles("./v2");

    setTimeout(async() => {
        if (arrayv1.length !== arrayv2.length) {
            console.log("Deben haber la misma cantidad de imagénes");
        } else {
            for (let i = 0; i < arrayv1.length; i++) {
                let template = {
                    label: `Escenario ${i + 1} `,
                    url: `https://clad741.github.io/scripthw/v2/${arrayv2[i]}`,
                    referenceUrl: `https://clad741.github.io/scripthw/v1/${arrayv1[i]}`,
                    readyEvent: "",
                    readySelector: "",
                    delay: 0,
                    hideSelectors: [],
                    removeSelectors: [],
                    hoverSelector: "",
                    clickSelector: "",
                    postInteractionWait: 0,
                    selectors: [],
                    selectorExpansion: true,
                    expect: 0,
                    misMatchThreshold: 0.1,
                    requireSameDimensions: true,
                };
                pruebasautomatizadas["scenarios"].push(template);
                let data1 = await JSON.stringify(pruebasautomatizadas);
                await fs.writeFileSync("backstop.json", data1);
            }
        }
    }, 2000);

    setTimeout(() => {
        ejecutarBackstop();
    }, 5000);
    setTimeout(() => {
        ejecutarBackstopApprove();
    }, 15000);
    setTimeout(() => {
        for (let j = 0; j < pruebasautomatizadas["scenarios"].length; j++) {
            let url = pruebasautomatizadas["scenarios"][j].url;
            let urlRef = pruebasautomatizadas["scenarios"][j].referenceUrl;
            pruebasautomatizadas["scenarios"][j].url = urlRef;
            pruebasautomatizadas["scenarios"][j].referenceUrl = url;
        }
        let data1 = JSON.stringify(pruebasautomatizadas);
        fs.writeFileSync("backstop.json", data1);
    }, 21000);

    setTimeout(() => {
        ejecutarBackstop();
    }, 27000);
}

iniciarScript();