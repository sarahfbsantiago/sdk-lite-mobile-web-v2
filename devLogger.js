/**
 * DevLogger - Logger avançado estilo DevTools para debug do backend
 * DevLogger - Advanced DevTools-style logger for backend debugging
 *
 * Mostra todo o ciclo de requisições com detalhes completos
 * Shows the complete request cycle with full details
 *
 * Similar ao Network Tab do Chrome DevTools
 * Similar to Chrome DevTools Network Tab
 */

import os from 'os';

// Step counter para cada ciclo / Step counter for each cycle
let stepCounter = 0;

// Cores ANSI para terminal / ANSI colors for terminal
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

// Contador de ciclos / Cycle counter
let cycleCounter = 0;

// Armazena inicio dos ciclos para calcular duração
// Stores cycle start times to calculate duration
const cycleTimers = new Map();

/**
 * Formata bytes para leitura humana
 * Formats bytes for human reading
 */
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Formata duração em ms
 * Formats duration in ms
 */
function formatDuration(ms) {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(2) + 's';
}

/**
 * Trunca string longa
 * Truncates long string
 */
function truncate(str, maxLen = 60) {
    if (!str) return str;
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen) + '...[truncated]';
}

/**
 * Desenha linha horizontal
 * Draws horizontal line
 */
function line(char = '━', length = 90) {
    return char.repeat(length);
}

/**
 * LOG: Servidor iniciado
 * LOG: Server Started
 */
export function logServerStart(port, env = {}) {
    const memUsage = process.memoryUsage();
    const c = colors;

    console.log('\n');
    console.log(c.bgCyan + c.bright + '┏' + line('━', 88) + '┓' + c.reset);
    console.log(c.bgCyan + c.bright + '┃  🚀 SERVER STARTED' + ' '.repeat(69) + '┃' + c.reset);
    console.log(c.cyan + '┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Timestamp:' + c.reset + c.cyan + ` ${new Date().toISOString()}`);
    console.log('┃  ' + c.bright + 'Port:' + c.reset + c.cyan + ` ${port}`);
    console.log('┃  ' + c.bright + 'Environment:' + c.reset + c.cyan + ` ${env.NODE_ENV || 'development'}`);
    console.log('┃  ' + c.bright + 'Node Version:' + c.reset + c.cyan + ` ${process.version}`);
    console.log('┃  ' + c.bright + 'Platform:' + c.reset + c.cyan + ` ${os.platform()} ${os.arch()}`);
    console.log('┃  ' + c.bright + 'Memory:' + c.reset + c.cyan + ` ${formatBytes(memUsage.heapUsed)} / ${formatBytes(memUsage.heapTotal)}`);
    console.log('┃  ' + c.bright + 'PID:' + c.reset + c.cyan + ` ${process.pid}`);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  📋 ' + c.bright + 'ENV LOADED' + c.reset + c.cyan);
    console.log('┃  ' + c.dim + 'API_URL:' + c.reset + c.cyan + ` ${env.API_URL || process.env.API_URL || 'not set'}`);
    console.log('┃  ' + c.dim + 'ACCOUNT_CODE:' + c.reset + c.cyan + ` ${env.ACCOUNT_CODE || process.env.ACCOUNT_CODE || 'not set'}`);
    console.log('┃  ' + c.dim + 'PUBLIC_API_KEY:' + c.reset + c.cyan + ` ${truncate(env.PUBLIC_API_KEY || process.env.PUBLIC_API_KEY, 50)}`);
    console.log('┃  ' + c.dim + 'PRIVATE_SECRET_KEY:' + c.reset + c.cyan + ` ${truncate(env.PRIVATE_SECRET_KEY || process.env.PRIVATE_SECRET_KEY, 30)}`);
    console.log('┃  ' + c.dim + 'BASE_URL:' + c.reset + c.cyan + ` ${env.BASE_URL || process.env.BASE_URL || 'not set'}`);
    console.log('┗' + line('━', 88) + '┛' + c.reset);
    console.log('\n');
}

/**
 * LOG: Início de ciclo de requisição
 * LOG: Request cycle start
 */
export function logCycleStart(req) {
    cycleCounter++;
    const cycleId = `req_${Date.now().toString(36)}_${cycleCounter}`;
    cycleTimers.set(cycleId, {
        start: Date.now(),
        yunoApiTime: 0,
    });

    const c = colors;

    console.log('\n');
    console.log(c.bgBlue + c.bright + '┏' + line('━', 88) + '┓' + c.reset);
    console.log(c.bgBlue + c.bright + `┃  🔄 REQUEST CYCLE #${cycleCounter}` + ' '.repeat(Math.max(0, 68 - String(cycleCounter).length)) + '┃' + c.reset);
    console.log(c.blue + '┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.dim + 'ID:' + c.reset + c.blue + ` ${cycleId}`);
    console.log('┃  ' + c.dim + 'Started:' + c.reset + c.blue + ` ${new Date().toISOString()}`);
    console.log('┃');
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  📥 ' + c.bright + 'INCOMING REQUEST' + c.reset + c.blue);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Method:' + c.reset + c.blue + ` ${c.bright}${req.method}${c.reset}${c.blue}`);
    console.log('┃  ' + c.bright + 'URL:' + c.reset + c.blue + ` ${req.originalUrl || req.url}`);
    console.log('┃  ' + c.bright + 'Full URL:' + c.reset + c.blue + ` ${req.protocol}://${req.get('host')}${req.originalUrl || req.url}`);
    console.log('┃  ' + c.bright + 'IP:' + c.reset + c.blue + ` ${req.ip || req.connection?.remoteAddress || 'unknown'}`);
    console.log('┃  ' + c.bright + 'User-Agent:' + c.reset + c.blue + ` ${truncate(req.get('user-agent'), 60)}`);
    console.log('┃');
    console.log('┃  ' + c.bright + 'Headers:' + c.reset + c.blue);

    const headers = req.headers;
    Object.keys(headers).forEach(key => {
        let value = headers[key];
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('auth')) {
            value = truncate(value, 30);
        }
        console.log('┃    ' + c.dim + key + ':' + c.reset + c.blue + ` ${value}`);
    });

    if (req.body && Object.keys(req.body).length > 0) {
        console.log('┃');
        console.log('┃  ' + c.bright + 'Body:' + c.reset + c.blue);
        const bodyLines = JSON.stringify(req.body, null, 2).split('\n');
        bodyLines.forEach(line => {
            console.log('┃    ' + c.cyan + line + c.blue);
        });
    }

    if (req.query && Object.keys(req.query).length > 0) {
        console.log('┃');
        console.log('┃  ' + c.bright + 'Query Params:' + c.reset + c.blue);
        const queryLines = JSON.stringify(req.query, null, 2).split('\n');
        queryLines.forEach(line => {
            console.log('┃    ' + line);
        });
    }

    console.log('┃' + c.reset);

    return cycleId;
}

/**
 * LOG: Chamada de função interna
 * LOG: Internal function call
 */
export function logFunction(cycleId, functionName, file, params) {
    const c = colors;

    console.log(c.magenta + '┣' + line('━', 88) + '┫');
    console.log('┃  ⚙️  ' + c.bright + `FUNCTION: ${functionName}()` + c.reset + c.magenta);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.dim + 'File:' + c.reset + c.magenta + ` ${file}`);
    console.log('┃  ' + c.dim + 'Cycle:' + c.reset + c.magenta + ` ${cycleId}`);
    console.log('┃');
    console.log('┃  ' + c.bright + 'Input params:' + c.reset + c.magenta);
    const paramLines = JSON.stringify(params, null, 2).split('\n');
    paramLines.forEach(line => {
        console.log('┃    ' + c.white + line + c.magenta);
    });
    console.log('┃' + c.reset);
}

/**
 * LOG: Chamada de API externa (Yuno)
 * LOG: External API call (Yuno)
 */
export function logExternalApiCall(cycleId, method, url, headers, body) {
    const timer = cycleTimers.get(cycleId);
    if (timer) {
        timer.yunoApiStart = Date.now();
    }

    const c = colors;

    // Oculta parcialmente as chaves sensíveis / Partially hides sensitive keys
    const safeHeaders = { ...headers };
    if (safeHeaders['public-api-key']) {
        safeHeaders['public-api-key'] = truncate(safeHeaders['public-api-key'], 40);
    }
    if (safeHeaders['private-secret-key']) {
        safeHeaders['private-secret-key'] = truncate(safeHeaders['private-secret-key'], 30);
    }

    console.log(c.yellow + '┣' + line('━', 88) + '┫');
    console.log('┃  🌐 ' + c.bright + 'EXTERNAL API CALL: YUNO' + c.reset + c.yellow);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Method:' + c.reset + c.yellow + ` ${c.bright}${method}${c.reset}${c.yellow}`);
    console.log('┃  ' + c.bright + 'URL:' + c.reset + c.yellow + ` ${url}`);
    console.log('┃');
    console.log('┃  ' + c.bright + 'Request Headers:' + c.reset + c.yellow);
    Object.keys(safeHeaders).forEach(key => {
        console.log('┃    ' + c.dim + key + ':' + c.reset + c.yellow + ` ${safeHeaders[key]}`);
    });
    console.log('┃');
    console.log('┃  ' + c.bright + 'Request Body:' + c.reset + c.yellow);
    const bodyLines = JSON.stringify(body, null, 2).split('\n');
    bodyLines.forEach(line => {
        console.log('┃    ' + c.white + line + c.yellow);
    });
    console.log('┃');
    console.log('┃  ⏱️  ' + c.dim + 'Waiting for Yuno response...' + c.reset + c.yellow);
    console.log('┃' + c.reset);
}

/**
 * LOG: Resposta de API externa (Yuno)
 * LOG: External API response (Yuno)
 */
export function logExternalApiResponse(cycleId, status, statusText, headers, body) {
    const timer = cycleTimers.get(cycleId);
    let apiTime = 0;
    if (timer && timer.yunoApiStart) {
        apiTime = Date.now() - timer.yunoApiStart;
        timer.yunoApiTime += apiTime;
    }

    const isSuccess = status >= 200 && status < 300;
    const c = colors;
    const color = isSuccess ? c.green : c.red;
    const icon = isSuccess ? '📨' : '❌';

    console.log(color + '┣' + line('━', 88) + '┫');
    console.log('┃  ' + icon + ' ' + c.bright + 'YUNO API RESPONSE' + c.reset + color);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Status:' + c.reset + color + ` ${c.bright}${status} ${statusText}${c.reset}${color}`);
    console.log('┃  ' + c.bright + 'Time:' + c.reset + color + ` ${c.bright}${formatDuration(apiTime)}${c.reset}${color}`);
    console.log('┃');

    if (headers) {
        const relevantHeaders = {};
        ['content-type', 'x-request-id', 'x-ratelimit-remaining', 'x-ratelimit-limit'].forEach(h => {
            const value = headers.get ? headers.get(h) : headers[h];
            if (value) relevantHeaders[h] = value;
        });
        if (Object.keys(relevantHeaders).length > 0) {
            console.log('┃  ' + c.bright + 'Response Headers:' + c.reset + color);
            Object.keys(relevantHeaders).forEach(key => {
                console.log('┃    ' + c.dim + key + ':' + c.reset + color + ` ${relevantHeaders[key]}`);
            });
            console.log('┃');
        }
    }

    console.log('┃  ' + c.bright + 'Response Body:' + c.reset + color);
    const bodyLines = JSON.stringify(body, null, 2).split('\n');
    bodyLines.forEach(line => {
        console.log('┃    ' + c.white + line + color);
    });
    console.log('┃' + c.reset);
}

/**
 * LOG: Retorno de função
 * LOG: Function return
 */
export function logFunctionReturn(cycleId, functionName, returnValue, duration) {
    const c = colors;

    console.log(c.green + '┣' + line('━', 88) + '┫');
    console.log('┃  ✅ ' + c.bright + `FUNCTION RETURN: ${functionName}()` + c.reset + c.green);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Duration:' + c.reset + c.green + ` ${c.bright}${formatDuration(duration)}${c.reset}${c.green}`);
    console.log('┃');
    console.log('┃  ' + c.bright + 'Return value:' + c.reset + c.green);
    const returnLines = JSON.stringify(returnValue, null, 2).split('\n');
    returnLines.forEach(line => {
        console.log('┃    ' + c.white + line + c.green);
    });
    console.log('┃' + c.reset);
}

/**
 * LOG: Resposta de saída
 * LOG: Outgoing response
 */
export function logOutgoingResponse(cycleId, statusCode, headers, body) {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const c = colors;
    const color = isSuccess ? c.cyan : c.red;

    console.log(color + '┣' + line('━', 88) + '┫');
    console.log('┃  📤 ' + c.bright + 'OUTGOING RESPONSE' + c.reset + color);
    console.log('┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Status:' + c.reset + color + ` ${c.bright}${statusCode}${c.reset}${color}`);
    console.log('┃');

    if (headers && Object.keys(headers).length > 0) {
        console.log('┃  ' + c.bright + 'Response Headers:' + c.reset + color);
        Object.keys(headers).forEach(key => {
            console.log('┃    ' + c.dim + key + ':' + c.reset + color + ` ${headers[key]}`);
        });
        console.log('┃');
    }

    console.log('┃  ' + c.bright + 'Response Body:' + c.reset + color);
    const bodyLines = JSON.stringify(body, null, 2).split('\n');
    bodyLines.forEach(line => {
        console.log('┃    ' + c.white + line + color);
    });
    console.log('┃' + c.reset);
}

/**
 * LOG: Fim do ciclo com resumo
 * LOG: Cycle end with summary
 */
export function logCycleEnd(cycleId, status) {
    const timer = cycleTimers.get(cycleId);
    const totalDuration = timer ? Date.now() - timer.start : 0;
    const yunoApiTime = timer?.yunoApiTime || 0;
    const internalTime = totalDuration - yunoApiTime;
    const memUsage = process.memoryUsage();

    const isSuccess = status >= 200 && status < 300;
    const c = colors;
    const bgColor = isSuccess ? c.bgGreen : c.bgRed;
    const color = isSuccess ? c.green : c.red;

    console.log(bgColor + c.bright + '┣' + line('━', 88) + '┫' + c.reset);
    console.log(bgColor + c.bright + '┃  📊 CYCLE SUMMARY' + ' '.repeat(70) + '┃' + c.reset);
    console.log(color + '┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Total Duration:' + c.reset + color + ` ${c.bright}${formatDuration(totalDuration)}${c.reset}${color}`);

    if (yunoApiTime > 0) {
        const yunoPercent = Math.round(yunoApiTime / totalDuration * 100) || 0;
        const internalPercent = Math.round(internalTime / totalDuration * 100) || 0;
        console.log('┃  ' + c.dim + 'Yuno API Time:' + c.reset + color + ` ${formatDuration(yunoApiTime)} (${yunoPercent}%)`);
        console.log('┃  ' + c.dim + 'Internal Processing:' + c.reset + color + ` ${formatDuration(internalTime)} (${internalPercent}%)`);
    }

    console.log('┃  ' + c.bright + 'Status:' + c.reset + color + ` ${c.bright}${isSuccess ? '✓ SUCCESS' : '✗ FAILED'}${c.reset}${color}`);
    console.log('┃  ' + c.dim + 'Memory Used:' + c.reset + color + ` ${formatBytes(memUsage.heapUsed)}`);
    console.log('┗' + line('━', 88) + '┛' + c.reset);
    console.log('\n');

    // Limpa o timer / Clears the timer
    cycleTimers.delete(cycleId);
}

/**
 * LOG: Erro
 * LOG: Error
 */
export function logError(cycleId, error, yunoResponse = null) {
    const c = colors;

    console.log(c.bgRed + c.bright + '┣' + line('━', 88) + '┫' + c.reset);
    console.log(c.bgRed + c.bright + '┃  ❌ ERROR' + ' '.repeat(78) + '┃' + c.reset);
    console.log(c.red + '┣' + line('━', 88) + '┫');
    console.log('┃  ' + c.bright + 'Type:' + c.reset + c.red + ` ${error.name || 'Error'}`);
    console.log('┃  ' + c.bright + 'Message:' + c.reset + c.red + ` ${error.message}`);

    if (error.code) {
        console.log('┃  ' + c.bright + 'Code:' + c.reset + c.red + ` ${error.code}`);
    }

    console.log('┃');
    console.log('┃  ' + c.bright + 'Stack Trace:' + c.reset + c.red);
    const stack = error.stack?.split('\n').slice(1, 6) || [];
    stack.forEach(line => {
        console.log('┃    ' + c.dim + line.trim() + c.reset + c.red);
    });

    if (yunoResponse) {
        console.log('┃');
        console.log('┃  ' + c.bright + 'Yuno Error Response:' + c.reset + c.red);
        const responseLines = JSON.stringify(yunoResponse, null, 2).split('\n');
        responseLines.forEach(line => {
            console.log('┃    ' + c.white + line + c.red);
        });
    }

    console.log('┃' + c.reset);
}

// Armazena cycleId atual para uso no yuno.js
// Stores current cycleId for use in yuno.js
let currentCycleId = null;

export function setCurrentCycleId(cycleId) {
    currentCycleId = cycleId;
    stepCounter = 0; // Reset step counter for new cycle / Reseta contador de passos para novo ciclo
}

export function getCurrentCycleId() {
    return currentCycleId;
}

/**
 * LOG: Step - Similar ao DevTools Network Tab
 * LOG: Step - Similar to DevTools Network Tab
 * Mostra cada passo do fluxo de forma clara
 * Shows each flow step clearly
 */
export function logStep(stepName, type, details = {}) {
    stepCounter++;
    const c = colors;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);

    // Cores por tipo / Colors by type
    const typeColors = {
        'REQUEST': c.blue,
        'FUNCTION': c.magenta,
        'API_CALL': c.yellow,
        'API_RESPONSE': c.green,
        'RESPONSE': c.cyan,
        'ERROR': c.red,
    };
    const color = typeColors[type] || c.white;

    // Ícones por tipo / Icons by type
    const typeIcons = {
        'REQUEST': '📥',
        'FUNCTION': '⚙️',
        'API_CALL': '🌐→',
        'API_RESPONSE': '←🌐',
        'RESPONSE': '📤',
        'ERROR': '❌',
    };
    const icon = typeIcons[type] || '•';

    console.log(color + `┃` + c.reset);
    console.log(color + `┃  ${c.dim}[${timestamp}]${c.reset}${color} ${c.bright}STEP ${stepCounter}: ${icon} ${stepName}${c.reset}`);

    if (details.method && details.url) {
        console.log(color + `┃  ${c.bright}${details.method}${c.reset}${color} ${details.url}`);
    }

    if (details.status) {
        const statusColor = details.status >= 200 && details.status < 300 ? c.green : c.red;
        console.log(color + `┃  Status: ${statusColor}${c.bright}${details.status} ${details.statusText || ''}${c.reset}`);
    }

    if (details.duration) {
        console.log(color + `┃  Duration: ${c.bright}${formatDuration(details.duration)}${c.reset}`);
    }

    if (details.headers && Object.keys(details.headers).length > 0) {
        console.log(color + `┃  ${c.dim}Headers:${c.reset}`);
        Object.keys(details.headers).slice(0, 5).forEach(key => {
            let value = details.headers[key];
            if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
                value = truncate(value, 25);
            }
            console.log(color + `┃    ${c.dim}${key}:${c.reset}${color} ${value}`);
        });
    }

    if (details.body) {
        console.log(color + `┃  ${c.dim}Body:${c.reset}`);
        const bodyStr = typeof details.body === 'string' ? details.body : JSON.stringify(details.body, null, 2);
        const bodyLines = bodyStr.split('\n').slice(0, 15);
        bodyLines.forEach(line => {
            console.log(color + `┃    ${c.white}${line}${c.reset}`);
        });
        if (bodyStr.split('\n').length > 15) {
            console.log(color + `┃    ${c.dim}... (truncated)${c.reset}`);
        }
    }

    console.log(color + `┃` + c.reset);
}

/**
 * LOG: Chamada de endpoint estilo Network
 * LOG: Network-style endpoint call
 */
export function logEndpoint(method, url, phase, details = {}) {
    const c = colors;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);

    const phaseConfig = {
        'START': { color: c.yellow, icon: '⏳', label: 'Pending' },
        'SUCCESS': { color: c.green, icon: '✓', label: 'Complete' },
        'ERROR': { color: c.red, icon: '✗', label: 'Failed' },
    };

    const config = phaseConfig[phase] || phaseConfig['START'];

    console.log(config.color + `┃` + c.reset);
    console.log(config.color + `┃  ${c.dim}[${timestamp}]${c.reset}${config.color} ${config.icon} ${c.bright}${method}${c.reset}${config.color} ${url}`);

    if (details.status) {
        console.log(config.color + `┃  └─ Status: ${c.bright}${details.status}${c.reset}${config.color} | Time: ${c.bright}${formatDuration(details.duration || 0)}${c.reset}`);
    }

    if (details.preview) {
        console.log(config.color + `┃  └─ Preview: ${c.dim}${truncate(JSON.stringify(details.preview), 60)}${c.reset}`);
    }
}

/**
 * LOG: Frontend Event - Mostra eventos do navegador no terminal
 * LOG: Frontend Event - Shows browser events in terminal
 * Estilo diferenciado (roxo) para separar do backend
 * Differentiated style (purple) to separate from backend
 */
export function logFrontend(event) {
    const c = colors;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);

    // Ícones por tipo de evento frontend / Icons by frontend event type
    const eventIcons = {
        'SDK_INIT_START': '🔄',
        'SDK_INIT_COMPLETE': '✅',
        'CHECKOUT_START': '🛒',
        'CHECKOUT_READY': '✅',
        'METHOD_SELECTED': '👆',
        'OTT_GENERATING': '🔐',
        'OTT_GENERATED': '🎫',
        'PAYMENT_SENDING': '📤',
        'PAYMENT_SENT': '✅',
        'SDK_EVENT': '📡',
        'USER_ACTION': '👤',
        'ERROR': '❌',
    };

    const icon = eventIcons[event.type] || '🌐';

    // Cor roxa para frontend (diferente do backend) / Purple color for frontend (different from backend)
    console.log(c.magenta + '┃' + c.reset);
    console.log(c.magenta + `┃  ${c.dim}[${timestamp}]${c.reset}${c.magenta} ${c.bgMagenta}${c.bright} FRONTEND ${c.reset}${c.magenta} ${icon} ${c.bright}${event.step}${c.reset}`);

    if (event.message) {
        console.log(c.magenta + `┃  ${event.message}` + c.reset);
    }

    if (event.data && Object.keys(event.data).length > 0) {
        console.log(c.magenta + `┃  ${c.dim}Data:${c.reset}`);
        const dataStr = JSON.stringify(event.data, null, 2);
        const dataLines = dataStr.split('\n').slice(0, 10);
        dataLines.forEach(line => {
            console.log(c.magenta + `┃    ${c.white}${line}${c.reset}`);
        });
        if (dataStr.split('\n').length > 10) {
            console.log(c.magenta + `┃    ${c.dim}... (truncated)${c.reset}`);
        }
    }

    if (event.duration) {
        console.log(c.magenta + `┃  Duration: ${c.bright}${formatDuration(event.duration)}${c.reset}`);
    }

    console.log(c.magenta + '┃' + c.reset);
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
    logError,
    setCurrentCycleId,
    getCurrentCycleId,
    logStep,
    logEndpoint,
    logFrontend
};
