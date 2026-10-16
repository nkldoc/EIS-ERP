<?php
// Legacy URL: never execute Git from an unauthenticated GET request.
header('Location: /NMU_permission/git-deploy.php', true, 302);
exit;