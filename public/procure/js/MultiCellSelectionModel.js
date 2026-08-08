/**
 * @class Ext.grid.MultiCellSelectionModel
 * @extends Ext.grid.CellSelectionModel
 * @cfg {Boolean} enableDrag Enable cell drag
 * @cfg {String} dragGroup The name of the drag group, the drag group will only interact with the corresponding drop group
 * @cfg {Boolean} enableDrop Enable cell drop
 * @cfg {String} dropGroup The name of the drop group, the drop group will only interact with the corresponding drag group
 */
Ext.grid.MultiCellSelectionModel = Ext.extend(Ext.grid.CellSelectionModel, {
    constructor: function (config) {
        var me = this;

        Ext.applyIf(config, {
            enableDrag: false,
            enableDrop: false
        });

        Ext.apply(me, config);

        me.addEvents(
          'beforecellselect',
          'cellselect',
          'selectionchange',
          'rowselect',
          'columnselect'
          );

        Ext.grid.MultiCellSelectionModel.superclass.constructor.call(me);

        me.selection = [];
        me.selectionIndex = {};
    },

    initEvents: function () {
        var me = this;
        Ext.grid.MultiCellSelectionModel.superclass.initEvents.call(me);

        // drag
        if (me.enableDrag === true) {
            me.grid.on('render', me.handleDrag, me);
        }

        // drop
        if (me.enableDrop === true) {
            me.grid.on('render', me.handleDrop, me);
        }

        // remove the original mousedown listener, since we need drag&drop
        // selection will be done on "mouseup" (cell click)
        me.grid.un('cellmousedown', me.handleMouseDown, me);
        me.grid.on('cellclick', me.handleMouseClick, me);
    },

    handleMouseClick: function (g, row, cell, e) {
        var me = this;
        if (e.button !== 0 || this.isLocked())
            return;

        var range = false,
          clear = true;

        if (e.ctrlKey == true) {
            clear = false;
        }

        if (e.shiftKey) {
            range = true;
        }

        me.select(row, cell, false, focus, null, range, clear);
    },

    handleDrag: function (grid) {
        var me = this,
          ddGroup = undefined;

        if (me.dragGroup && me.dragGroup.length > 0) {
            ddGroup = me.dragGroup;
        }

        grid.dragZone = new Ext.dd.DragZone(grid.getEl(), {
            ddGroup: ddGroup,

            getDragData: function (e) {
                var selection = me.getSelectedCells();

                if (!selection)
                    return;

                if (selection.length === 0)
                    return;

                var dragEl = document.createElement('div'),
                  target = e.getTarget(),
                  rowIndex = grid.view.findRowIndex(target),
                  cellIndex = grid.view.findCellIndex(target);

                dragEl.innerHTML = String.format('{0} cells selected', selection.length);

                return {
                    ddel: dragEl,
                    selection: selection,
                    selectionSource: {
                        x: cellIndex,
                        y: rowIndex
                    }
                };
            },

            getRepairXY: function (e) {
                var me = this,
                  dd = me.dragData;

                return Ext.Element.fly(dd.selection[0].el).getXY();
            }
        });
    },

    handleDrop: function (grid) {
        var me = this,
          ddGroup = undefined;

        if (me.dropGroup && me.dropGroup.length > 0) {
            ddGroup = me.dropGroup;
        }

        grid.dropZone = new Ext.dd.DropZone(grid.getView().scroller, {
            ddGroup: ddGroup,

            getTargetFromEvent: function (e) {
                return e.getTarget('.x-grid3-cell');
            },

            onNodeEnter: function (target, dd, e, data) {
                var i,
                  cell,
                  x,
                  y,
                  trgt;

                var rowIndex = grid.view.findRowIndex(target),
                  cellIndex = grid.view.findCellIndex(target),
                  offsetX = cellIndex - data.selectionSource.x,
                  offsetY = rowIndex - data.selectionSource.y;

                for (i = 0; i < data.selection.length; ++i) {
                    cell = data.selection[i].cell;
                    x = cell[1] + offsetX;
                    y = cell[0] + offsetY;

                    if (!grid.view.getRow(y)) {
                        continue;
                    }

                    trgt = grid.view.getCell(y, x);

                    if (!trgt) {
                        continue;
                    }

                    Ext.fly(trgt).addClass('x-grid3-cell-selected');
                }
            },

            onNodeOut: function (target, dd, e, data) {
                var i,
                  cell,
                  x,
                  y,
                  trgt;

                var rowIndex = grid.view.findRowIndex(target),
                  cellIndex = grid.view.findCellIndex(target),
                  offsetX = cellIndex - data.selectionSource.x,
                  offsetY = rowIndex - data.selectionSource.y;

                for (i = 0; i < data.selection.length; ++i) {
                    cell = data.selection[i].cell;
                    x = cell[1] + offsetX;
                    y = cell[0] + offsetY;

                    if (!grid.view.getRow(y)) {
                        continue;
                    }

                    trgt = grid.view.getCell(y, x);

                    if (!trgt) {
                        continue;
                    }

                    Ext.fly(trgt).removeClass('x-grid3-cell-selected');
                }
            },

            onNodeDrop: function (target, dd, e, data) {
                return true;
            }
        });
    },

    select: function (rowIndex, colIndex, preventViewNotify, preventFocus, r, range, clear) {
        var me = this;

        if (me.fireEvent('beforecellselect', me, rowIndex, colIndex) === false)
            return;

        var x, x1, minX, maxX,
          y, y1, minY, maxY,
          v = me.grid.getView();

        // clear
        if (clear === true) {
            me.clearSelections();
        }

        if (range === true) {
            // range
            if (me.rangeStart == null) {
                me.rangeStart = [rowIndex, colIndex];
                me.rangeStop = [rowIndex, colIndex];
            } else {
                me.rangeStop = [rowIndex, colIndex];
            }

            x1 = me.rangeStart[1];
            y1 = me.rangeStart[0];
            x2 = me.rangeStop[1];
            y2 = me.rangeStop[0];

            minX = (x2 < x1) ? x2 : x1;
            maxX = (x2 < x1) ? x1 : x2;
            minY = (y2 < y1) ? y2 : y1;
            maxY = (y2 < y1) ? y1 : y2;

            // select
            for (x = minX; x <= maxX; ++x) {
                for (y = minY; y <= maxY; ++y) {
                    if (me.isSelected(y, x)) {
                        me.removeFromSelection(y, x);
                    } else {
                        me.addToSelection(y, x);
                        if (!preventViewNotify) {
                            v.onCellSelect(y, x);
                        }
                    }
                }
            }
        } else {
            // single cell
            me.rangeStart = [rowIndex, colIndex];
            me.rangeStop = [rowIndex, colIndex];

            if (me.isSelected(rowIndex, colIndex)) {
                me.removeFromSelection(rowIndex, colIndex);
            } else {
                me.addToSelection(rowIndex, colIndex);
                if (!preventViewNotify) {
                    v.onCellSelect(rowIndex, colIndex);
                }
            }
        }

        me.fireEvent('cellselect', me, rowIndex, colIndex);
        me.fireEvent('selectionchange', me, me.selection);
    },

    /**
     * @private
     */
    addToSelection: function (rowIndex, colIndex) {
        var me = this,
          r,
          obj;

        r = r || me.grid.store.getAt(rowIndex);
        obj = {
            record: r,
            cell: [rowIndex, colIndex],
            el: me.grid.view.getCell(rowIndex, colIndex)
        };

        me.selectionIndex[colIndex + ',' + rowIndex] = obj;
        me.selection.push(obj);

        if (me.rangeStart === null) {
            me.rangeStart = [rowIndex, colIndex];
        } else {
            me.rangeStop = [rowIndex, colIndex];
        }
    },

    /**
     * @private
     */
    isSelected: function (rowIndex, colIndex) {
        var key = colIndex + ',' + rowIndex;

        if (!this.selectionIndex[key])
            return false;

        return true;
    },

    /**
     * @private
     */
    removeFromSelection: function (rowIndex, colIndex) {
        var me = this,
          s = me.selection,
          key = colIndex + ',' + rowIndex;

        me.selectionIndex[key] = null;
        delete me.selectionIndex[key];

        for (i = 0; i < s.length; ++i) {
            if (s[i].cell[0] == rowIndex && s[i].cell[1] == colIndex) {
                me.grid.view.onCellDeselect(s[i].cell[0], s[i].cell[1]);
                s.splice(i, 1);
            }
        }

        me.fireEvent('selectionchange', me, null);
    },

    clearSelections: function (preventNotify) {
        var me = this,
          s = me.selection;

        if (!s)
            return;

        var i;
        if (preventNotify !== true) {
            for (i = 0; i < s.length; ++i) {
                me.grid.view.onCellDeselect(s[i].cell[0], s[i].cell[1]);
            }
        }

        me.selection = [];
        me.selectionIndex = {};
        me.fireEvent('selectionchange', me, null);
    },

    handleKeyDown: Ext.emptyFn,

    getSelectedCells: function () {
        return this.selection;
    },

    /**
     * Selects a grid row.
     * @param {Number} rowIndex 0-based row index.
     */
    selectRow: function (rowIndex) {
        var i,
          me = this;

        if (!me.columnCount) {
            me.columnCount = me.grid.colModel.config.length;
        }

        // clear
        me.clearSelections();

        // select
        for (i = 1; i <= me.columnCount; ++i) {
            me.select(rowIndex, i, false, true, null, false, false);
        }
    },

    /**
     * Selects a grid column.
     * @param columnIndex 0-based column index.
     */
    selectColumn: function (columnIndex) {
        var i,
          me = this;

        // make index 0-based
        columnIndex++;

        if (!me.rowCount) {
            me.rowCount = me.grid.store.data.length;
        }

        // clear
        me.clearSelections();

        // select
        for (i = 0; i < me.rowCount; ++i) {
            me.select(i, columnIndex, false, true, null, false, false);
        }
    }
}); //MultiCellSelectionModel.js