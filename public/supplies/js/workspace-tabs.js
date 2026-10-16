(function () {
    'use strict';

    function normalize(route) {
        route = String(route || '').replace(/^\s+|\s+$/g, '').replace(/^\.\//, '');
        if (route.indexOf('/supplies/') === 0) route = route.substring(10);
        if (!route || route.charAt(0) === '/' || /["'<>\\#]/.test(route) ||
                route.indexOf('..') !== -1 || !/^[A-Za-z0-9_./-]+(?:\?[^#]*)?$/.test(route)) return '';
        var parts = route.split('?'), path = parts.shift();
        if (!/\.[a-z0-9]+$/i.test(path)) path += '.php';
        // For external units this menu is the PR list, without the legacy
        // document-workflow wrapper or a duplicate workspace tab.
        if (window.SUPPLIES_EXTERNAL_UNIT &&
                /^(?:sp\/app\/tab|sp\/CheckList)\.php$/i.test(path)) return 'sp/CheckList.php';
        return path + (parts.join('?') ? '?' + parts.join('?') : '');
    }

    Ext.ux = Ext.ux || {};
    Ext.ux.SuppliesWorkspace = Ext.extend(Ext.TabPanel, {
        cls: 'supplies-workspace',
        border: false,
        enableTabScroll: true,
        deferredRender: true,
        resizeTabs: true,
        minTabWidth: 130,
        tabWidth: 210,
        activeTab: 0,
        initComponent: function () {
            this.on('tabchange', function (panel, tab) {
                if (!tab || !tab.workspaceRoute) return;
                var parts = tab.workspaceRoute.split('?');
                Ext.page = {uri: parts.shift().replace(/\.php$/, ''), method: parts.join('?')};
                var tree = Ext.getCmp('TreePanel1ID');
                if (tree && tree.rendered && tree.root) tree.root.cascade(function (node) {
                    if (node.leaf && normalize(String(node.id).replace(/-/g, '/')) === tab.workspaceRoute) {
                        tree.getSelectionModel().select(node);
                    }
                });
                if (panel.rendered) {
                    var frame = tab.body && tab.body.dom.querySelector('iframe');
                    // Older child pages address the active frame by this ID.
                    panel.items.each(function (item) {
                        var iframe = item.body && item.body.dom.querySelector('iframe');
                        if (iframe) iframe.removeAttribute('id');
                    });
                    if (frame) frame.id = 'iframecontentID';
                }
                if (Ext.refreshSuppliesAdminTools) Ext.refreshSuppliesAdminTools();
            });
            this.on('afterrender', function () {
                var panel = this, tree = Ext.getCmp('TreePanel1ID');
                if (tree && tree.loader) tree.loader.on('load', function () {
                    panel.items.each(function (tab) {
                        if (tab.workspaceRoute) tab.setTitle(Ext.util.Format.htmlEncode(tab.workspaceTitle || panel.pageInfo(tab.workspaceRoute).title));
                    });
                });
            });
            Ext.ux.SuppliesWorkspace.superclass.initComponent.call(this);
        },
        pageInfo: function (route) {
            var known = {
                'bi/dashBoard.php': 'หน้าแรก',
                'sp/CheckList.php': 'รายการ PR',
                'ai/index.html': 'AI ถามตอบ',
                'sp/info.php': 'ข้อมูลส่วนตัว',
                'alert/st0001.php': 'ข้อมูล PR ซื้อจ้าง',
                'alert/period.php': 'ข้อมูลสัญญาซื้อจ้าง',
                'sp/find.php': 'ค้นหา PR',
                'sp/appAuditDoc01.php': 'รายการส่งตรวจก่อนลงนาม'
            };
            var info = {title: known[route.split('?')[0]] || route.split('?')[0], icon: './images/icons/page_white_text.png'};
            var tree = Ext.getCmp('TreePanel1ID');
            if (tree && tree.root) tree.root.cascade(function (node) {
                if (!node.leaf) return;
                if (normalize(String(node.id).replace(/-/g, '/')) === route) {
                    info.title = Ext.util.Format.stripTags(node.text);
                    info.icon = node.attributes.icon || info.icon;
                }
            });
            return info;
        },
        openPage: function (route, title) {
            route = normalize(route);
            if (!route) return null;
            var existing = null;
            this.items.each(function (tab) { if (tab.workspaceRoute === route) existing = tab; });
            if (existing) {
                if (title) {
                    existing.workspaceTitle = title;
                    existing.setTitle(Ext.util.Format.htmlEncode(title));
                    var frame = existing.body && existing.body.dom.querySelector('iframe');
                    if (frame) frame.title = title;
                }
                this.setActiveTab(existing);
                return existing;
            }
            var info = this.pageInfo(route);
            var tab = this.add({
                title: Ext.util.Format.htmlEncode(title || info.title),
                iconCls: route === 'bi/dashBoard.php' ? 'workspace-home-icon' : 'workspace-page-icon',
                workspaceRoute: route,
                workspaceTitle: title || null,
                closable: route !== 'bi/dashBoard.php' && !(window.SUPPLIES_EXTERNAL_UNIT && route === 'sp/CheckList.php'),
                border: false,
                layout: 'fit',
                autoEl: {tag: 'div'},
                items: [{xtype: 'box', listeners: {afterrender: function (box) {
                    box.el.on('load', function () {
                        if (Ext.refreshSuppliesAdminTools) Ext.refreshSuppliesAdminTools();
                    });
                }}, autoEl: {
                    tag: 'iframe', src: './' + route,
                    title: title || info.title, frameborder: '0',
                    style: 'display:block;width:100%;height:100%;border:0;background:#fff;'
                }}]
            });
            this.setActiveTab(tab);
            return tab;
        },
        // Keep compatibility with existing toolbar actions and child pages.
        update: function (html) {
            var match = typeof html === 'string' && html.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i);
            if (match) return this.openPage(match[1].replace(/&amp;/g, '&'));
            return Ext.ux.SuppliesWorkspace.superclass.update.apply(this, arguments);
        }
    });
    Ext.ux.SuppliesWorkspace.normalizeRoute = normalize;
    Ext.reg('suppliesworkspace', Ext.ux.SuppliesWorkspace);
})();
