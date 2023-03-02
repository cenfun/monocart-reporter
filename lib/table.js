const Util = require('./util.js');
const TableModule = {

    getOption: (option, dataOption) => {
        const defaultOption = {
            styleTable: {
                'border': '1px #555 solid',
                'border-collapse': 'collapse'
            },
            styleHead: {
                'background': '#ddd',
                'padding': '5px 5px',
                'border': '1px #555 solid'
            },
            styleTr: {},
            styleTd: {
                'padding': '5px 5px',
                'border': '1px #555 solid'
            },
            width: '',
            noResults: 'no results'
        };
        return Util.mergeOption(defaultOption, option, dataOption);
    },

    generateHtml: (tableData, option) => {
        option = TableModule.getOption(option, tableData.option);
        const rows = tableData.rows;
        const columns = tableData.columns;
        if (!Util.isList(rows) || !Util.isList(columns)) {
            return option.noResults;
        }
        const list = [];
        const styleTable = TableModule.getStyleAttr(option.styleTable, {
            width: option.width
        });
        list.push(`<table${styleTable}>\n`);
        if (!option.hideHeaders) {
            list.push('<thead>\n');
            list.push('<tr>\n');
            columns.forEach((column) => {
                const styleTd = TableModule.getCellStyle(option.styleHead, column);
                list.push(`<td${styleTd}`);
                if (column.title) {
                    list.push(` title="${column.title}"`);
                }
                list.push('>');
                let v = column.id;
                if (Util.hasOwn(column, 'name')) {
                    v = column.name;
                }
                list.push(v);
                list.push('</td>\n');
            });
            list.push('</tr>\n');
            list.push('</thead>\n');
        }
        const currentRowspan = {};
        rows.forEach((row) => {
            TableModule.generateRowHtml(list, option, row, columns, currentRowspan);
        });
        list.push('</table>\n');
        const html = list.join('');
        return html;
    },

    /* eslint-disable complexity*/
    generateRowHtml: function(list, option, row, columns, currentRowspan) {
        if (!row) {
            return;
        }
        if (row.innerHTML) {
            list.push(row.innerHTML);
            return;
        }
        const classTr = row.className ? ` class="${row.className}"` : '';
        const styleTr = TableModule.getStyleAttr(option.styleTr, row.style);
        list.push(`<tr${classTr}${styleTr}>\n`);
        let currentColspan = 0;
        columns.forEach((column, i) => {
            const id = column.id;

            // colspan
            currentColspan -= 1;
            if (currentColspan > 0) {
                return;
            }
            let colspan = '';
            const cellColspan = row[`${id}_colspan`];
            if (cellColspan && cellColspan > 1) {
                colspan = ` colspan="${cellColspan}"`;
                currentColspan = cellColspan;
            }

            // rowspan
            if (currentRowspan[id] > 0) {
                return;
            }
            let rowspan = '';
            const cellRowspan = row[`${id}_rowspan`];
            if (cellRowspan && cellRowspan > 1) {
                rowspan = ` rowspan="${cellRowspan}"`;
                currentRowspan[id] = cellRowspan;
                if (cellColspan > 1) {
                    columns.forEach((c, k) => {
                        if (k > i && k < i + cellColspan) {
                            currentRowspan[c.id] = cellRowspan;
                        }
                    });
                }
            }
            const classTd = column.className ? ` class="${column.className}"` : '';
            const styleTd = TableModule.getCellStyle(option.styleTd, column, row);
            list.push(`<td${rowspan}${colspan}${classTd}${styleTd}>`);
            const v = TableModule.getCellValue(option, column, row);
            list.push(v);
            list.push('</td>\n');
        });
        list.push('</tr>\n');

        Object.keys(currentRowspan).forEach(function(id) {
            currentRowspan[id] -= 1;
        });
        // console.log(currentRowspan);

        // row subs handler
        if (row.subs) {
            row.subs.forEach((sub) => {
                TableModule.generateRowHtml(list, option, sub, columns, currentRowspan);
            });
        }
    },
    /* eslint-enable*/

    getStyleAttr: function() {
        const list = [{}];
        let css = '';
        for (let i = 0, l = arguments.length; i < l; i++) {
            const item = arguments[i];
            if (!item) {
                continue;
            }
            if (typeof (item) === 'object') {
                list.push(item);
            } else {
                css += item;
            }
        }
        const styles = Object.assign.apply(Object, list);
        let style = '';
        Object.keys(styles).forEach((k) => {
            const v = styles[k];
            if (v) {
                style += `${k}:${v};`;
            }
        });
        style += css;
        if (style) {
            style = ` style="${style}"`;
        }
        return style;
    },

    getCellStyle: (styleCell, column, row) => {
        // for global
        const args = [styleCell];

        // for column header
        if (column.align) {
            args.push({
                'text-align': column.align
            });
        }

        // for column
        if (column.style) {
            args.push(column.style);
        }

        // for row
        if (row) {
            const cellStyle = row[`${column.id}_style`];
            if (cellStyle) {
                args.push(cellStyle);
            }
        }

        const style = TableModule.getStyleAttr.apply(TableModule, args);

        return style;
    },

    getCellValue: (option, column, row) => {
        let v = row[column.id];
        const formatter = column.formatter;
        if (typeof (formatter) === 'function') {
            v = formatter.call(this, v, row, column);
        }
        return v;
    },

    generateBarChart: (tests, passed, failed, flaky) => {

        const styleTable = TableModule.getStyleAttr({
            'border-collapse': 'collapse',
            'width': '100px',
            'border': 'none'
        });

        let html = `<table${styleTable}><tr>`;

        let pw = 0;
        let fw = 0;
        let kw = 0;
        if (tests) {
            pw = Math.round(passed / tests * 100);
            fw = Math.round(failed / tests * 100);
            kw = Math.round(flaky / tests * 100);
        }
        const sw = 100 - pw - fw - kw;

        const list = [{
            value: pw,
            style: {
                'background': '#478500',
                'padding': '0',
                'border': 'none'
            }
        }, {
            value: fw,
            style: {
                'background': '#e70000',
                'padding': '0',
                'border': 'none'
            }
        }, {
            value: kw,
            style: {
                'background': '#ffa500',
                'padding': '0',
                'border': 'none'
            }
        }, {
            value: sw,
            style: {
                'background': '#bbb',
                'padding': '0',
                'border': 'none'
            }
        }];

        list.forEach(function(item) {
            const v = item.value;
            if (v === 0) {
                return;
            }
            const styleTd = TableModule.getStyleAttr(item.style, {
                width: `${v}px`
            });
            let td = `<td${styleTd}>`;
            if (v > 5) {
                td += '&nbsp;';
            }
            td += '</td>';
            html += td;
        });

        html += '</tr></table>';
        return html;
    }

};

module.exports = TableModule;
