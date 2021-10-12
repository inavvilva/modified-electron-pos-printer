/*
 * Copyright (c) 2019. Author Hubert Formin <hformin@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const ipcRender = require('electron').ipcRenderer;

const body = $('#main');
let barcodeNumber = 0;
const image_format = ['apng', 'bmp', 'gif', 'ico', 'cur', 'jpeg', 'jpg', 'jpeg', 'jfif', 'pjpeg',
    'pjp', 'png', 'svg', 'tif', 'tiff', 'webp'];

ipcRender.on('body-init', function (event, arg) {
    body.css({width: arg.width ? arg.width : 170 , margin: arg.margin ? arg.margin : 0});
    event.sender.send('body-init-reply', {status: true, error: null});
});
// render each line
ipcRender.on('render-line', function (event, arg) {
    renderDataToHTML(event, arg);
});

async function renderDataToHTML(event, arg) {
    switch (arg.line.type) {
        case 'text':
            try {
              body.append(generatePageText(arg.line));
              // sending msg
              event.sender.send('render-line-reply', {status: true, error: null});
            } catch (e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'image':
            await getImageFromPath(arg.line)
                .then(img => {
                    body.append(img);
                    event.sender.send('render-line-reply', {status: true, error: null});
                }).catch(e => {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            })
        return;
        case 'qrCode':
            try {
                body.append(`<div id="qrCode${arg.lineIndex}" style="${arg.line.style};text-align: ${arg.line.position ? '-webkit-' + arg.line.position : '-webkit-left'};"></div>`);
                new QRCode(document.getElementById(`qrCode${arg.lineIndex}`), {
                  text: arg.line.value,
                  width: arg.line.width ? arg.line.width : 1,
                  height: arg.line.height ? arg.line.height : 15,
                  colorDark: '#000000',
                  colorLight: '#ffffff',
                  correctLevel: QRCode.CorrectLevel.H
                });
               // $(`#qrcode${barcodeNumber}`).attr('style',arg.style);
               event.sender.send('render-line-reply', {status: true, error: null});
            } catch(e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'DoubleBarCode':
            try {
                
                body.append(`
                <div >
                <table style='margin-left: auto; margin-right: auto ;font-family:Helvetica, sans-serif';border: none;>
                        <tr >
                        <td style="text-align:center;padding:16px;overflow:hidden;" > 
                        <div style="${arg.line.style}">
                        <p style="${arg.line.headerStyle1}">testheader${arg.line.headerText1}</p>
                            <img class="barCode${arg.lineIndex}1"  style="text-align:center;width:60%"
                        jsbarcode-value="${arg.line.value1}"
                        jsbarcode-width="${arg.line.width ? arg.line.width : 1}"
                        jsbarcode-height="${arg.line.height ? arg.line.height : 15}"
                        jsbarcode-fontsize="${arg.line.fontsize ? arg.line.fontsize : 16}"
                        jsbarcode-margin="0"
                        jsbarcode-displayvalue="${!!arg.line.displayValue}"/>
                        <p style="${arg.line.itemStyle1}">${arg.line.value1}</p>
                        <p style="${arg.line.lineStyle1}">${arg.line.additionalText1}</p>
                        <p style="${arg.line.footerStyle1}">${arg.line.footerText1}</p>
                       </div>
                        </td>
                        <td style="text-align:center;padding:16px;overflow:hidden" >
                        <div style="${arg.line.style}">
                        <p style="${arg.line.headerStyle2}">${arg.line.headerText2}</p>
                        <img class="barCode${arg.lineIndex}1" style="text-align:center;width:60%" 
                        jsbarcode-value="${arg.line.value2}"
                        jsbarcode-width="${arg.line.width ? arg.line.width : 1}"
                        jsbarcode-height="${arg.line.height ? arg.line.height : 15}"
                        jsbarcode-fontsize="${arg.line.fontsize ? arg.line.fontsize : 16}"
                        jsbarcode-margin="0"
                        jsbarcode-displayvalue="${!!arg.line.displayValue}"/>
                        <p style="${arg.line.itemStyle1}">${arg.line.value2}</p>
                        <p style="${arg.line.lineStyle2}">${arg.line.additionalText2}</p>
                        <p style="${arg.line.footerStyle2}">${arg.line.footerText2}</p>
                        </div>
                        </td>
                        </tr>
                </table>
                </div>
   
                `);
                JsBarcode(`.barCode${arg.lineIndex}1`).init();
                JsBarcode(`.barCode${arg.lineIndex}2`).init();
                // send

                event.sender.send('render-line-reply', {status: true, error: null});
            } catch(e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'oneInchDoubleBarCode':
            try {
                body.append(`
                <div >
                <table style='margin-left: auto; margin-right: auto ;font-family:Helvetica, sans-serif';border: none;>
                        <tr style="border-bottom: none;">
                        <td style="text-align:center;padding:16px;overflow:hidden;" > 
                        <div style="${arg.line.style}">
                        <p style="${arg.line.headerStyle1}">${arg.line.headerText1}</p>
                            <img class="barCode${arg.lineIndex}1"  style="text-align:center;width:60%"
                        jsbarcode-value="${arg.line.value1}"
                        jsbarcode-width="${arg.line.width ? arg.line.width : 1}"
                        jsbarcode-height="${arg.line.height ? arg.line.height : 15}"
                        jsbarcode-fontsize="${arg.line.fontsize ? arg.line.fontsize : 16}"
                        jsbarcode-margin="0"
                        jsbarcode-displayvalue="${!!arg.line.displayValue}"/>
                        <p style="${arg.line.itemStyle1}">${arg.line.value1}</p>
                        <p style="${arg.line.lineStyle1}">${arg.line.additionalText1}</p>
                        <p style="${arg.line.footerStyle1}">${arg.line.footerText1}</p>
                       </div>
                        </td>
                        <td style="text-align:center;padding:16px;overflow:hidden" >
                        <div style="${arg.line.style}">
                       
                        </div>
                        </td>
                        </tr>
                </table>
                </div>
   
                `);
                JsBarcode(`.barCode${arg.lineIndex}1`).init();
                JsBarcode(`.barCode${arg.lineIndex}2`).init();
                // send

                event.sender.send('render-line-reply', {status: true, error: null});
            } catch(e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'SingleBarCode':
            try {
                body.append(`
                <div style="border: none;">
                <table style='margin-left: auto; margin-right: auto ;font-family:Helvetica, sans-serif';border: none;>
                        <tr style="border-bottom: none;">
                        <td style="text-align:center;padding:16px;overflow:hidden;" > 
                        <div style="${arg.line.style}">
                        <p style="${arg.line.headerStyle1}">${arg.line.headerText1}</p>
                            <img class="barCode${arg.lineIndex}"  style="text-align:center;width:60%"
                        jsbarcode-value="${arg.line.value1}"
                        jsbarcode-width="${arg.line.width ? arg.line.width : 1}"
                        jsbarcode-height="${arg.line.height ? arg.line.height : 15}"
                        jsbarcode-fontsize="${arg.line.fontsize ? arg.line.fontsize : 16}"
                        jsbarcode-margin="0"
                        jsbarcode-displayvalue="${!!arg.line.displayValue}"/>
                        <p style="${arg.line.itemStyle1}">${arg.line.value1}</p>
                        <p style="${arg.line.lineStyle1}">${arg.line.additionalText1}</p>
                        <p style="${arg.line.footerStyle1}">${arg.line.footerText1}</p>
                       </div>
                        </td>
                        </tr>
                </table>
                </div>
   
                `);
                JsBarcode(`.barCode${arg.lineIndex}`).init();
               
                // send

                event.sender.send('render-line-reply', {status: true, error: null});
            } catch(e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'oneInchBarCode':
            try {
                body.append(`
                <div style="width:100%;font-family:Helvetica, sans-serif;display: flex;
                flex-direction: row;                
                justify-content: center;
                align-items: center;
                text-align:center">
               
                        <div style="${arg.line.style}">
                        <p style="${arg.line.headerStyle1}">${arg.line.headerText1}</p>
                            <img class="barCode${arg.lineIndex}" style="text-align:center;width:50%"
                        jsbarcode-value="${arg.line.value1}"
                        jsbarcode-width="${arg.line.width ? arg.line.width : 1}"
                        jsbarcode-height="${arg.line.height ? arg.line.height : 15}"
                        jsbarcode-fontsize="${arg.line.fontsize ? arg.line.fontsize : 16}"
                        jsbarcode-margin="0"
                        jsbarcode-displayvalue="${!!arg.line.displayValue}"/>
                        <p style="margin-top: -3px;font-size:6px">${arg.line.value1}</p>
                        <p style="${arg.line.lineStyle1}">${arg.line.additionalText1}</p>
                        <p style="${arg.line.footerStyle1}">${arg.line.footerText1}</p>
                       </div>
                      
                </div>
   
                `);
                JsBarcode(`.barCode${arg.lineIndex}`).init();
                // send

                event.sender.send('render-line-reply', {status: true, error: null});
            } catch(e) {
                event.sender.send('render-line-reply', {status: false, error: e.toString()});
            }
        return;
        case 'table':
            // Creating table
            const tableContainer = $(`
               <div></div>`);
            const table = $(`<table id="table${arg.lineIndex}" style="${arg.line.style}"></table>`);
            if (arg.line.css) {
                for (const key in arg.line.css) {
                    const item = arg.line.css[key];
                    table.css(key, item);
                }
            }
            const tHeader = $(`<thead style="${arg.line.tableHeaderStyle}"></thead>`);
            const tBody = $(`<tbody style="${arg.line.tableBodyStyle}"></tbody>`);
            const tFooter = $(`<tfoot style="${arg.line.tableFooterStyle}"></tfoot>`);
            // 1. Headers
            if (arg.line.tableHeader) {
                arg.line.tableHeader.forEach(async (headerArg, index) => {
                    if (typeof headerArg === "object") {
                        switch (headerArg.type) {
                            case 'image':
                                await getImageFromPath(headerArg)
                                    .then(img => {
                                        const th = $(`<th></th>`);
                                        th.append(img);
                                        tHeader.append(th);
                                    }).catch((e) => {
                                        event.sender.send('render-line-reply', {status: false, error: e.toString()});
                                    })
                                return;
                            case 'text':
                                tHeader.append(generateTableCell(headerArg, 'th'));
                                return;
                        }
                    } else {
                        const th = $(`<th>${headerArg}</th>`);
                        tHeader.append(th);
                    }
                });
            }
            // 2. Body
            if (arg.line.tableBody) {
                arg.line.tableBody.forEach((bodyRow) => {
                    const rowTr = $('<tr></tr>');
                    bodyRow.forEach(async (colArg, index) => {
                        if (typeof colArg === 'object') {
                            switch (colArg.type) {
                                case 'image':
                                    await getImageFromPath(colArg)
                                        .then(img => {
                                            const th = $(`<td></td>`);
                                            th.append(img);
                                            rowTr.append(th);
                                        }).catch((e) => {
                                            event.sender.send('render-line-reply', {status: false, error: e.toString()});
                                        })
                                    return;
                                case 'text':
                                    rowTr.append(generateTableCell(colArg));
                                    return;
                                
                            }
                        } else {
                            const th = $(`<td>${colArg}</td>`);
                            rowTr.append(th);
                        }
                    });
                    tBody.append(rowTr);
                });
            }
            // 3. Footer
            if (arg.line.tableFooter) {
                arg.line.tableFooter.forEach(async (footerArg, index) => {
                    if (typeof footerArg === 'object') {
                        switch (footerArg.type) {
                            case 'image':
                                await getImageFromPath(footerArg)
                                    .then(img => {
                                        const footerTh = $(`<th></th>`);
                                        footerTh.append(img);
                                        tFooter.append(footerTh);
                                    }).catch((e) => {
                                        event.sender.send('render-line-reply', {status: false, error: e.toString()});
                                    })
                                return;
                            case 'text':
                                tFooter.append(generateTableCell(footerArg, 'th'));
                                return;
                        }
                    } else {
                        const footerTh = $(`<th>${footerArg}</th>`);
                        tFooter.append(footerTh);
                    }
                });
            }
            // render table
            table.append(tHeader);
            table.append(tBody);
            table.append(tFooter);
            tableContainer.append(table);
            body.append(tableContainer);
            // send
            event.sender.send('render-line-reply', {status: true, error: null});
        return;
    }
}
/**
* @function
 * @name generatePageText
 * @param arg {pass argumet of type PosPrintData}
 * @description used for type text, used to generate type text
* */
function generatePageText(arg) {
    const text = arg.value;
    const css = arg.css;
    arg.style = arg.style ? arg.style : '';
    const div = $(`<div class="font" style="${arg.style}">${text}</div>`);
    if (css) {
        for (const key in css) {
            const item = css[key];
            div.css(key, item);
        }
    }
    return div;
}
/**
* @function
 * @name generateTableCell
 * @param arg {pass argumet of type PosPrintData}
 * @description used for type text, used to generate type text
* */
function generateTableCell(arg, type = 'td') {
    const text = arg.value;
    const css = arg.css;
    arg.style = arg.style ? arg.style : '';
    const th = type === 'th' ? $(`<th style="padding:7px 2px;${arg.style}">${text}</th>`) : $(`<td style="padding:7px 2px;${arg.style}">${text}</td>`);
    if (css) {
        for (const key in css) {
            const item = css[key];
            th.css(key, item);
        }
    }
    return th;
}
/**
* @function
 * @name getImageFromPath
 * @param arg {pass argumet of type PosPrintData}
 * @description get image from path and return it as an html img
* */
function getImageFromPath(arg) {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(arg.path);
        let ext = path.extname(arg.path).slice(1);
        if (image_format.indexOf(ext) === -1) {
            reject(new Error(ext +' file type not supported, consider the types: ' + image_format.join()));
        }
        if (ext === 'svg') { ext = 'svg+xml'; }
        // insert image
        const uri = 'data:image/' + ext + ';base64,' + data.toString('base64');
        const img_con = $(`<div style="width: 100%;text-align:${arg.position ? arg.position : 'left'}"></div>`);
        arg.style = arg.style ? arg.style : '';
        const img = $(`<img src="${uri}" style="height: ${arg.height ? arg.height : '50px'};width: ${arg.width ? arg.width : 'auto'};${arg.style}" />`);
        if (arg.css) {
            for (const key in arg.css) {
                const item = arg.css[key];
                img.css(key, item);
            }
        }
        // appending
        img_con.prepend(img);
        resolve(img_con);
    });
}
