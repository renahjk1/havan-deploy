<?php
// Nova implementação SKALEPAY - criada do zero
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Função para gerar CPF válido (mesma do GHOSTSPAY)
function gerarCPF() {
    $cpf = '';
    for ($i = 0; $i < 9; $i++) {
        $cpf .= rand(0, 9);
    }

    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    $resto = $soma % 11;
    $digito1 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito1;

    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    $resto = $soma % 11;
    $digito2 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito2;

    $invalidos = [
        '00000000000', '11111111111', '22222222222', '33333333333', 
        '44444444444', '55555555555', '66666666666', '77777777777', 
        '88888888888', '99999999999'
    ];

    if (in_array($cpf, $invalidos)) {
        return gerarCPF();
    }

    return $cpf;
}

try {
    // Configurações da API SKALEPAY
    $apiUrl = 'https://api.conta.skalepay.com.br/v1';
    $secretKey = 'sk_live_XXXXX';

    // Conecta ao SQLite (mesmo sistema do GHOSTSPAY)
    $dbPath = __DIR__ . '/database.sqlite';
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se a tabela 'pedidos' existe e cria se necessário
    $db->exec("CREATE TABLE IF NOT EXISTS pedidos (
        transaction_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        valor INTEGER NOT NULL,
        nome TEXT,
        email TEXT,
        cpf TEXT,
        utm_params TEXT,
        created_at TEXT,
        updated_at TEXT
    )");

    // Recebe os parâmetros (mesmo sistema do GHOSTSPAY)
    $valor_recebido = $_POST['amount'] ?? $_POST['valor'] ?? null;
    
    if (!$valor_recebido) {
        throw new Exception('Valor não informado');
    }
    
    // Converte o valor para centavos (mesmo sistema do GHOSTSPAY)
    if (is_numeric($valor_recebido)) {
        $valor_float = floatval($valor_recebido);
        
        // Debug: log do valor original
        error_log("[SKALEPAY] 🔍 Debug - Valor original: " . $valor_recebido . " | Como float: " . $valor_float);
        
        // Como o frontend sempre envia em reais, sempre multiplica por 100
        if (function_exists('bcmul')) {
            $valor_centavos = intval(bcmul($valor_float, 100, 0));
        } else {
            $valor_centavos = intval(round($valor_float * 100));
        }
        
        // Debug: log após conversão
        error_log("[SKALEPAY] 🔍 Debug - Após conversão: " . $valor_centavos . " centavos");
        
    } else {
        throw new Exception('Valor deve ser numérico');
    }

    if ($valor_centavos <= 0) {
        throw new Exception('Valor deve ser maior que zero');
    }
    
    if ($valor_centavos < 500) {
        throw new Exception('Valor mínimo é R$ 5,00 (500 centavos). Valor atual: ' . $valor_centavos . ' centavos');
    }

    error_log("[SKALEPAY] 💰 Valor recebido: " . $valor_recebido . " | Valor float: " . $valor_float . " | Valor em centavos: " . $valor_centavos);

    // Gera dados do cliente (mesmo sistema do GHOSTSPAY)
    $nomes_masculinos = [
        'João', 'Pedro', 'Lucas', 'Miguel', 'Arthur', 'Gabriel', 'Bernardo', 'Rafael',
        'Gustavo', 'Felipe', 'Daniel', 'Matheus', 'Bruno', 'Thiago', 'Carlos'
    ];

    $nomes_femininos = [
        'Maria', 'Ana', 'Julia', 'Sofia', 'Isabella', 'Helena', 'Valentina', 'Laura',
        'Alice', 'Manuela', 'Beatriz', 'Clara', 'Luiza', 'Mariana', 'Sophia'
    ];

    $sobrenomes = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 
        'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 
        'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
    ];

    // Parâmetros UTM (mesmo sistema do GHOSTSPAY)
    $utmParams = [
        'utm_source' => $_POST['utm_source'] ?? null,
        'utm_medium' => $_POST['utm_medium'] ?? null,
        'utm_campaign' => $_POST['utm_campaign'] ?? null,
        'utm_content' => $_POST['utm_content'] ?? null,
        'utm_term' => $_POST['utm_term'] ?? null,
        'xcod' => $_POST['xcod'] ?? null,
        'sck' => $_POST['sck'] ?? null
    ];

    $utmParams = array_filter($utmParams, function($value) {
        return $value !== null && $value !== '';
    });

    error_log("[SKALEPAY] 📊 Parâmetros UTM recebidos: " . json_encode($utmParams));

    // Gera dados do cliente
    $genero = rand(0, 1);
    $nome = $genero ? 
        $nomes_masculinos[array_rand($nomes_masculinos)] : 
        $nomes_femininos[array_rand($nomes_femininos)];
    
    $sobrenome1 = $sobrenomes[array_rand($sobrenomes)];
    $sobrenome2 = $sobrenomes[array_rand($sobrenomes)];
    
    $nome_cliente = "$nome $sobrenome1 $sobrenome2";
    $email = "clienteteste@gmail.com";
    $cpf = gerarCPF();

    error_log("[SKALEPAY] 📝 Preparando dados para envio: " . json_encode([
        'valor_recebido' => $valor_recebido,
        'valor_centavos' => $valor_centavos,
        'nome' => $nome_cliente,
        "email" => "clienteteste@gmail.com",
        'cpf' => $cpf
    ]));

    // Dados para SKALEPAY (formato específico da API)
    $data = [
        "amount" => $valor_centavos,
        "paymentMethod" => "pix",
        "customer" => [
            "name" => $nome_cliente,
            "email" => $email,
            "document" => [
                "number" => $cpf,
                "type" => "cpf"
            ],
            "phone" => "11999999999"
        ],
        "items" => [
            [
                "title" => "Liberação de Benefício",
                "quantity" => 1,
                "unitPrice" => $valor_centavos,
                "tangible" => false
            ]
        ],
        "pix" => [
            "expiresInDays" => 1
        ],
        "metadata" => json_encode($utmParams)
    ];

    error_log("[SKALEPAY] 🌐 URL da requisição: " . $apiUrl . '/transactions');
    error_log("[SKALEPAY] 📦 Dados enviados: " . json_encode($data));

    // Chama API SKALEPAY
    $auth = base64_encode($secretKey . ':x');
    
    $ch = curl_init($apiUrl . '/transactions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    curl_setopt($ch, CURLOPT_VERBOSE, true);
    $verbose = fopen('php://temp', 'w+');
    curl_setopt($ch, CURLOPT_STDERR, $verbose);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlErrno = curl_errno($ch);

    rewind($verbose);
    $verboseLog = stream_get_contents($verbose);
    error_log("[SKALEPAY] 🔍 Detalhes da requisição cURL:\n" . $verboseLog);

    if ($curlError) {
        error_log("[SKALEPAY] ❌ Erro cURL: " . $curlError . " (errno: " . $curlErrno . ")");
        throw new Exception("Erro na requisição: " . $curlError);
    }

    curl_close($ch);

    error_log("[SKALEPAY] 📊 HTTP Status Code: " . $httpCode);
    error_log("[SKALEPAY] 📄 Resposta bruta: " . $response);

    if ($httpCode !== 200) {
        throw new Exception("Erro na API: HTTP " . $httpCode . " - " . $response);
    }

    $result = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar resposta: " . json_last_error_msg() . " - Resposta: " . $response);
    }

    if (!isset($result['id'])) {
        throw new Exception("ID não encontrado na resposta da API");
    }

    // Salva os dados no SQLite (mesmo sistema do GHOSTSPAY)
    $stmt = $db->prepare("INSERT INTO pedidos (transaction_id, status, valor, nome, email, cpf, utm_params, created_at) 
        VALUES (:transaction_id, 'pending', :valor, :nome, :email, :cpf, :utm_params, :created_at)");
    $stmt->execute([
        'transaction_id' => $result['id'],
        'valor' => $valor_centavos,
        'nome' => $nome_cliente,
        'email' => $email,
        'cpf' => $cpf,
        'utm_params' => json_encode($utmParams),
        'created_at' => date('c')
    ]);

    session_start();
    $_SESSION['payment_id'] = $result['id'];

    error_log("[SKALEPAY] 💳 Transação criada com sucesso: " . $result['id']);
    error_log("[SKALEPAY] 📄 Resposta completa da API: " . $response);
    error_log("[SKALEPAY] 🔑 Token gerado: " . $result['id']);

    // Integração com utmify-pendente.php (mesmo sistema do GHOSTSPAY)
    error_log("[Sistema] 📡 Iniciando comunicação com utmify-pendente.php");

    $utmifyData = [
        'orderId' => $result['id'],
        'platform' => 'MinhaPlataforma',
        'paymentMethod' => 'pix',
        'status' => 'waiting_payment',
        'createdAt' => date('Y-m-d H:i:s'),
        'approvedDate' => null,
        'refundedAt' => null,
        'customer' => [
            'name' => $nome_cliente,
            'email' => $email,
            'phone' => null,
            'document' => $cpf,
            'country' => 'BR',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? null
        ],
        'products' => [
            [
                'id' => uniqid('PROD_'),
                'name' => 'taxca cn',
                'planId' => null,
                'planName' => null,
                'quantity' => 1,
                'priceInCents' => $valor_centavos
            ]
        ],
        'trackingParameters' => $utmParams,
        'commission' => [
            'totalPriceInCents' => $valor_centavos,
            'gatewayFeeInCents' => isset($result['fee']['fixedAmount']) ? $result['fee']['fixedAmount'] : 0,
            'userCommissionInCents' => $valor_centavos
        ],
        'isTest' => false
    ];

    error_log("[Utmify] 📦 Preparando dados para envio ao utmify-pendente.php: " . json_encode($utmifyData));

    // Envia para utmify-pendente.php
    error_log("[Sistema] 📡 Enviando requisição POST para ../utmify-pendente.php");
    
    $serverUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
    $utmifyUrl = $serverUrl . "/loja/utmify-pendente.php";
    error_log("[Sistema] 🔍 URL do utmify-pendente.php: " . $utmifyUrl);
    
    $ch = curl_init($utmifyUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($utmifyData),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 10
    ]);

    $utmifyResponse = curl_exec($ch);
    $utmifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $utmifyError = curl_error($ch);
    $utmifyErrno = curl_errno($ch);
    
    error_log("[Sistema] 🔍 Detalhes da requisição Utmify: " . print_r([
        'url' => $utmifyUrl,
        'status' => $utmifyHttpCode,
        'resposta' => $utmifyResponse,
        'erro' => $utmifyError,
        'errno' => $utmifyErrno
    ], true));
    
    curl_close($ch);

    error_log("[Sistema] ✉️ Resposta do utmify-pendente.php: " . $utmifyResponse);
    error_log("[Sistema] 📊 Status code do utmify-pendente.php: " . $utmifyHttpCode);

    if ($utmifyHttpCode !== 200) {
        error_log("[Sistema] ❌ Erro ao enviar dados para utmify-pendente.php: " . $utmifyResponse);
    } else {
        error_log("[Sistema] ✅ Dados enviados com sucesso para utmify-pendente.php");
    }

    // Extrai código PIX da resposta SKALEPAY
    $pixCode = $result['pix']['qrcode'] ?? null;

    // Preparar resposta (mesmo formato do GHOSTSPAY)
    $responseData = [
        'success' => true,
        'token' => $result['id'],
        'pixCode' => $pixCode,
        'qrCodeUrl' => isset($pixCode) ? 
            'https://api.qrserver.com/v1/create-qr-code/?data=' . urlencode($pixCode) . '&size=300x300&charset-source=UTF-8&charset-target=UTF-8&qzone=1&format=png&ecc=L' : 
            null,
        'valor' => $valor_centavos / 100, // Retorna em reais para o frontend
        'valor_centavos' => $valor_centavos,
        'logs' => [
            'utmParams' => $utmParams,
            'transacao' => [
                'valor_recebido' => $valor_recebido,
                'valor_centavos' => $valor_centavos,
                'cliente' => $nome_cliente,
                'email' => $email,
                'cpf' => $cpf
            ],
            'utmifyResponse' => [
                'status' => $utmifyHttpCode,
                'resposta' => $utmifyResponse
            ]
        ]
    ];

    error_log("[SKALEPAY] 📤 Enviando resposta ao frontend: " . json_encode($responseData));
    echo json_encode($responseData);

} catch (Exception $e) {
    error_log("[SKALEPAY] ❌ Erro: " . $e->getMessage());
    error_log("[SKALEPAY] 🔍 Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao gerar o PIX: ' . $e->getMessage()
    ]);
}
?>

