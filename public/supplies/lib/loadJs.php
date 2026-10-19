<?php
// Version static scripts by modification time so repeat visits can use cache.
$scriptVersion = static function ($relativePath) {
    return '?v=' . (string) filemtime(__DIR__ . '/' . $relativePath);
};
?>

<script type="text/javascript" src="../js/jquery.js<?= $scriptVersion('../js/jquery.js'); ?>"></script>
<script type="text/javascript" src="../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js<?= $scriptVersion('../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js'); ?>"></script>
<script type="text/javascript" src="../js/ext-3.4.0/ext-all-debug.js<?= $scriptVersion('../js/ext-3.4.0/ext-all-debug.js'); ?>"></script>
<script type="text/javascript" src="../js/Date/calendarOverride.js<?= $scriptVersion('../js/Date/calendarOverride.js'); ?>"></script>
<script type="text/javascript" src="../js/config.js<?= $scriptVersion('../js/config.js'); ?>"></script>
<script type="text/javascript" src="../js/InfoMainGrid.js<?= $scriptVersion('../js/InfoMainGrid.js'); ?>"></script>
<script type="text/javascript" src="../js/validationForm.js<?= $scriptVersion('../js/validationForm.js'); ?>"></script>
<script type="text/javascript" src="../js/Excel/Exporter-all.js<?= $scriptVersion('../js/Excel/Exporter-all.js'); ?>"></script>
<script type="text/javascript" src="../js/Ext.ux.util.js<?= $scriptVersion('../js/Ext.ux.util.js'); ?>"></script>
<script type="text/javascript" src="../js/ComboCheckBox/js/Ext.ux.form.ThemeCombo.js<?= $scriptVersion('../js/ComboCheckBox/js/Ext.ux.form.ThemeCombo.js'); ?>"></script>
<script type="text/javascript" src="../js/ComboCheckBox/js/Ext.ui.ComboCheckBox.js<?= $scriptVersion('../js/ComboCheckBox/js/Ext.ui.ComboCheckBox.js'); ?>"></script>
<script type="text/javascript" src="../js/Ext.ux.LinkButton.js<?= $scriptVersion('../js/Ext.ux.LinkButton.js'); ?>"></script>
<script type="text/javascript" src="../js/Ext.ux.FileUpload.js<?= $scriptVersion('../js/Ext.ux.FileUpload.js'); ?>"></script>
<script type="text/javascript" src="../js/Ext.ux.Poplov.js<?= $scriptVersion('../js/Ext.ux.Poplov.js'); ?>"></script>
<script type="text/javascript" src="../js/Ext.ux.IdCardField.js<?= $scriptVersion('../js/Ext.ux.IdCardField.js'); ?>"></script>
<script type="text/javascript" src="../js/build/livegrid-all-debug.js<?= $scriptVersion('../js/build/livegrid-all-debug.js'); ?>"></script>
<script type="text/javascript" src="../js/fileUpload/js/FileUploadField.js<?= $scriptVersion('../js/fileUpload/js/FileUploadField.js'); ?>"></script>
<script type="text/javascript" src="../js/fileUpload/js/xlsx_0.15.1_jszip.js<?= $scriptVersion('../js/fileUpload/js/xlsx_0.15.1_jszip.js'); ?>"></script>
<script type="text/javascript" src="../js/fileUpload/js/xlsx_0.15.1_xlsx.js<?= $scriptVersion('../js/fileUpload/js/xlsx_0.15.1_xlsx.js'); ?>"></script>
<script type="text/javascript" src="../js/examples/examples.js<?= $scriptVersion('../js/examples/examples.js'); ?>"></script>
<script type="text/javascript" src="../js/loadingStore.js<?= $scriptVersion('../js/loadingStore.js'); ?>"></script>
<script type="text/javascript" src="../js/funcAll.js<?= $scriptVersion('../js/funcAll.js'); ?>"></script>
