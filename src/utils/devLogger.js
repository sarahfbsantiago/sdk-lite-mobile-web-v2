/**
 * DevLogger - Logger avançado estilo DevTools para debug do backend
 * Mostra todo o ciclo de requisições com detalhes completos
 */

import os from 'os';

// Cores ANSI para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
};

// Contador de ciclos
let cycleCounter = 0;

// Armazena inicio dos ciclos para calcular duração
const cycleTimers = new Map();

/**
 * Formata bytes para leitura humana
 */
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Formata duração em ms
 */
function formatDuration(ms) {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(2) + 's';
}

/**
 * Trunca string longa
 */
function truncate(str, maxLen = 60) {
    if (!str) return str;
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen) + '...[truncated]';
}

/**
 * Desenha linha horizontal
 */
function line(char = '━', length = 85) {
    return char.repeat(length);
}

/**
 * Desenha caixa com título
 */
function boxTop(title = '') {
    const padding = 85 - title.length - 4;
    return `┏━━ ${title} ${line('━', padding)}┓`;
}

function boxMid(title = '') {
    const padding = 85 - title.length - 4;
    return `┣━━ ${title} ${line('━', padding)}┫`;
}

function boxBottom() {
    return `┗${line('━', 85)}┛`;
}

function boxLine(content = '') {
    const lines = content.split('\n');
    return lines.map(l => `┃  ${l}`).join('\n');
}

/**
 * LOG: Server Started
 */
export function logServerStart(port, env) {
    const memUsage = process.memoryUsage();

    console.log('\n' + colors.bgCyan + colors.bright + boxTop('🚀 SERVER STARTED') + colors.reset);
    console.log(colors.cyan + boxLine(`Timestamp: ${new Date().toISOString()}`));
    console.log(boxLine(`Port: ${port}`));
    console.log(boxLine(`Environment: ${env.NODE_ENV || 'development'}`));
    console.log(boxLine(`Node Version: ${process.version}`));
    console.log(boxLine(`Platform: ${os.platform()} ${os.arch()}`));
    console.log(boxLine(`Memory: ${formatBytes(memUsage.heapUsed)} / ${formatBytes(memUsage.heapTotal)}`));
    console.log(boxLine(`PID: ${process.pid}`));
    console.log(boxMid('📋 ENV LOADED'));
    console.log(boxLine(`API_URL: ${env.API_URL || 'not set'}`));
    console.log(boxLine(`ACCOUNT_CODE: ${env.ACCOUNT_CODE || 'not set'}`));
    console.log(boxLine(`PUBLIC_API_KEY: ${truncate(env.PUBLIC_API_KEY, 50)}`));
    console.log(boxLine(`PRIVATE_SECRET_KEY: ${truncate(env.PRIVATE_SECRET_KEY, 30)}`));
    console.log(boxLine(`BASE_URL: ${env.BASE_URL || 'not set'}`));
    console.log(boxBottom() + colors.reset);
    console.log('\n');
}

/**
 * LOG: Início de ciclo de requisição
 */
export function logCycleStart(req) {
    cycleCounter++;
    const cycleId = `req_${Date.now().toString(36)}_${cycleCounter}`;
    cycleTimers.set(cycleId, {
        start: Date.now(),
        yunoApiTime: 0,
        steps: []
    });

    console.log('\n' + colors.bgBlue + colors.bright);
    console.log(boxTop(`🔄 REQUEST CYCLE #${cycleCounter}`));
    console.log(colors.reset + colors.blue);
    console.log(boxLine(`ID: ${cycleId}`));
    console.log(boxLine(`Started: ${new Date().toISOString()}`));
    console.log(boxMid('📥 INCOMING REQUEST'));
    console.log(boxLine(`Method: ${colors.bright}${req.method}${colors.reset}${colors.blue}`));
    console.log(boxLine(`URL: ${req.originalUrl || req.url}`));
    console.log(boxLine(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl || req.url}`));
    console.log(boxLine(`IP: ${req.ip || req.connection?.remoteAddress || 'unknown'}`));
    console.log(boxLine(`User-Agent: ${truncate(req.get('user-agent'), 70)}`));
    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Headers:${colors.reset}${colors.blue}`));
    console.log(boxLine(JSON.stringify(req.headers, null, 2).split('\n').map(l => '  ' + l).join('\n')));

    if (req.body && Object.keys(req.body).length > 0) {
        console.log(boxLine(''));
        console.log(boxLine(`${colors.bright}Body:${colors.reset}${colors.blue}`));
        console.log(boxLine(JSON.stringify(req.body, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    }

    if (req.query && Object.keys(req.query).length > 0) {
        console.log(boxLine(''));
        console.log(boxLine(`${colors.bright}Query Params:${colors.reset}${colors.blue}`));
        console.log(boxLine(JSON.stringify(req.query, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    }

    console.log(colors.reset);

    return cycleId;
}

/**
 * LOG: Chamada de função interna
 */
export function logFunction(cycleId, functionName, file, params) {
    console.log(colors.magenta);
    console.log(boxMid(`⚙️  FUNCTION: ${functionName}()`));
    console.log(boxLine(`File: ${file}`));
    console.log(boxLine(`Cycle: ${cycleId}`));
    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Input params:${colors.reset}${colors.magenta}`));
    console.log(boxLine(JSON.stringify(params, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(colors.reset);
}

/**
 * LOG: Chamada de API externa (Yuno)
 */
export function logExternalApiCall(cycleId, method, url, headers, body) {
    const timer = cycleTimers.get(cycleId);
    if (timer) {
        timer.yunoApiStart = Date.now();
    }

    // Oculta parcialmente as chaves sensíveis
    const safeHeaders = { ...headers };
    if (safeHeaders['public-api-key']) {
        safeHeaders['public-api-key'] = truncate(safeHeaders['public-api-key'], 40);
    }
    if (safeHeaders['private-secret-key']) {
        safeHeaders['private-secret-key'] = truncate(safeHeaders['private-secret-key'], 30);
    }

    console.log(colors.yellow);
    console.log(boxMid('🌐 EXTERNAL API CALL: YUNO'));
    console.log(boxLine(`Method: ${colors.bright}${method}${colors.reset}${colors.yellow}`));
    console.log(boxLine(`URL: ${url}`));
    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Request Headers:${colors.reset}${colors.yellow}`));
    console.log(boxLine(JSON.stringify(safeHeaders, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Request Body:${colors.reset}${colors.yellow}`));
    console.log(boxLine(JSON.stringify(body, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(boxLine(''));
    console.log(boxLine(`⏱️  Waiting for Yuno response...`));
    console.log(colors.reset);
}

/**
 * LOG: Resposta de API externa (Yuno)
 */
export function logExternalApiResponse(cycleId, status, statusText, headers, body) {
    const timer = cycleTimers.get(cycleId);
    let apiTime = 0;
    if (timer && timer.yunoApiStart) {
        apiTime = Date.now() - timer.yunoApiStart;
        timer.yunoApiTime += apiTime;
    }

    const isSuccess = status >= 200 && status < 300;
    const color = isSuccess ? colors.green : colors.red;
    const icon = isSuccess ? '📨' : '❌';

    console.log(color);
    console.log(boxMid(`${icon} YUNO API RESPONSE`));
    console.log(boxLine(`Status: ${colors.bright}${status} ${statusText}${colors.reset}${color}`));
    console.log(boxLine(`Time: ${colors.bright}${formatDuration(apiTime)}${colors.reset}${color}`));
    console.log(boxLine(''));

    if (headers) {
        const relevantHeaders = {};
        ['content-type', 'x-request-id', 'x-ratelimit-remaining', 'x-ratelimit-limit'].forEach(h => {
            if (headers[h]) relevantHeaders[h] = headers[h];
        });
        if (Object.keys(relevantHeaders).length > 0) {
            console.log(boxLine(`${colors.bright}Response Headers:${colors.reset}${color}`));
            console.log(boxLine(JSON.stringify(relevantHeaders, null, 2).split('\n').map(l => '  ' + l).join('\n')));
            console.log(boxLine(''));
        }
    }

    console.log(boxLine(`${colors.bright}Response Body:${colors.reset}${color}`));
    console.log(boxLine(JSON.stringify(body, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(colors.reset);
}

/**
 * LOG: Retorno de função
 */
export function logFunctionReturn(cycleId, functionName, returnValue, duration) {
    console.log(colors.green);
    console.log(boxMid(`✅ FUNCTION RETURN: ${functionName}()`));
    console.log(boxLine(`Duration: ${colors.bright}${formatDuration(duration)}${colors.reset}${colors.green}`));
    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Return value:${colors.reset}${colors.green}`));
    console.log(boxLine(JSON.stringify(returnValue, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(colors.reset);
}

/**
 * LOG: Resposta de saída
 */
export function logOutgoingResponse(cycleId, statusCode, headers, body) {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const color = isSuccess ? colors.cyan : colors.red;

    console.log(color);
    console.log(boxMid('📤 OUTGOING RESPONSE'));
    console.log(boxLine(`Status: ${colors.bright}${statusCode}${colors.reset}${color}`));
    console.log(boxLine(''));

    if (headers && Object.keys(headers).length > 0) {
        console.log(boxLine(`${colors.bright}Response Headers:${colors.reset}${color}`));
        console.log(boxLine(JSON.stringify(headers, null, 2).split('\n').map(l => '  ' + l).join('\n')));
        console.log(boxLine(''));
    }

    console.log(boxLine(`${colors.bright}Response Body:${colors.reset}${color}`));
    console.log(boxLine(JSON.stringify(body, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log(colors.reset);
}

/**
 * LOG: Fim do ciclo com resumo
 */
export function logCycleEnd(cycleId, status) {
    const timer = cycleTimers.get(cycleId);
    const totalDuration = timer ? Date.now() - timer.start : 0;
    const yunoApiTime = timer?.yunoApiTime || 0;
    const internalTime = totalDuration - yunoApiTime;
    const memUsage = process.memoryUsage();

    const isSuccess = status >= 200 && status < 300;
    const color = isSuccess ? colors.bgGreen : colors.bgRed;

    console.log(color + colors.bright);
    console.log(boxMid('📊 CYCLE SUMMARY'));
    console.log(colors.reset + (isSuccess ? colors.green : colors.red));
    console.log(boxLine(`Total Duration: ${colors.bright}${formatDuration(totalDuration)}${colors.reset}${isSuccess ? colors.green : colors.red}`));
    console.log(boxLine(`Yuno API Time: ${formatDuration(yunoApiTime)} (${Math.round(yunoApiTime/totalDuration*100) || 0}%)`));
    console.log(boxLine(`Internal Processing: ${formatDuration(internalTime)} (${Math.round(internalTime/totalDuration*100) || 0}%)`));
    console.log(boxLine(`Status: ${colors.bright}${isSuccess ? 'SUCCESS' : 'FAILED'}${colors.reset}${isSuccess ? colors.green : colors.red}`));
    console.log(boxLine(`Memory Used: ${formatBytes(memUsage.heapUsed)}`));
    console.log(boxBottom());
    console.log(colors.reset + '\n');

    // Limpa o timer
    cycleTimers.delete(cycleId);
}

/**
 * LOG: Erro
 */
export function logError(cycleId, error, yunoResponse = null) {
    console.log(colors.bgRed + colors.bright);
    console.log(boxMid('❌ ERROR'));
    console.log(colors.reset + colors.red);
    console.log(boxLine(`Type: ${error.name || 'Error'}`));
    console.log(boxLine(`Message: ${error.message}`));

    if (error.code) {
        console.log(boxLine(`Code: ${error.code}`));
    }

    console.log(boxLine(''));
    console.log(boxLine(`${colors.bright}Stack Trace:${colors.reset}${colors.red}`));
    const stack = error.stack?.split('\n').slice(1, 5) || [];
    stack.forEach(line => {
        console.log(boxLine(`  ${line.trim()}`));
    });

    if (yunoResponse) {
        console.log(boxLine(''));
        console.log(boxLine(`${colors.bright}Yuno Error Response:${colors.reset}${colors.red}`));
        console.log(boxLine(JSON.stringify(yunoResponse, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    }

    console.log(colors.reset);
}

// Export default object
export default {
    logServerStart,
    logCycleStart,
    logFunction,
    logExternalApiCall,
    logExternalApiResponse,
    logFunctionReturn,
    logOutgoingResponse,
    logCycleEnd,
    logError
};
