<?php
// Nova implementação SKALEPAY - verificar do zero
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'ID não fornecido']);
    exit;
}

$id = $_GET['id'];

// Remove qualquer caractere especial ou espaço do ID
$id = trim($id);
$id = preg_replace('/[^a-zA-Z0-9\-]/', '', $id);

try {
    error_log("[SKALEPAY-Verificar] 🔍 Consultando status para transação: " . $id);
    
    // Configurações da API SKALEPAY
    $apiUrl = 'https://api.conta.skalepay.com.br/v1';
    $secretKey = getenv('SKALEPAY_SECRET_KEY') ?: 'sk_live_XXXXX'; // Use variável de ambiente

    // Conecta ao SQLite (fallback local)
    $dbPath = __DIR__ . '/database.sqlite';
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Busca dados locais primeiro
    $stmt = $db->prepare("SELECT * FROM pedidos WHERE transaction_id = :transaction_id");
    $stmt->execute(['transaction_id' => $id]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

    // Consulta API SKALEPAY para status atualizado
    $auth = base64_encode($secretKey . ':x');

    $ch = curl_init($apiUrl . '/transactions/' . $id);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Basic ' . $auth,
            'Accept: application/json'
        ],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    if ($curlError) {
        error_log("[SKALEPAY-Verificar] ❌ Erro cURL: " . $curlError);
        
        // Fallback para dados locais se API falhar
        if ($pedido) {
            echo json_encode([
                'success' => true,
                'status' => $pedido['status'],
                'transaction_id' => $pedido['transaction_id'],
                'source' => 'local_fallback',
                'data' => [
                    'amount' => $pedido['valor'],
                    'created_at' => $pedido['created_at'],
                    'updated_at' => $pedido['updated_at'],
                    'customer' => [
                        'name' => $pedido['nome'],
                        'email' => $pedido['email'],
                        'document' => $pedido['cpf']
                    ]
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'Erro de conectividade e pedido não encontrado localmente'
            ]);
        }
        exit;
    }

    curl_close($ch);

    error_log("[SKALEPAY-Verificar] 📊 HTTP Status Code: " . $httpCode);

    if ($httpCode === 200) {
        $apiResult = json_decode($response, true);
        
        if (json_last_error() === JSON_ERROR_NONE && isset($apiResult['status'])) {
            $apiStatus = $apiResult['status'];
            
            error_log("[SKALEPAY-Verificar] 📄 Resposta da API: " . $response);
            
            // Mapeia status SKALEPAY para padrão
            $statusMap = [
                'paid' => 'paid',
                'approved' => 'paid',
                'pending' => 'pending',
                'waiting_payment' => 'pending',
                'cancelled' => 'cancelled',
                'canceled' => 'cancelled',
                'expired' => 'expired',
                'failed' => 'failed',
                'refused' => 'failed'
            ];

            $mappedStatus = $statusMap[$apiStatus] ?? $apiStatus;

            // Atualiza status local se mudou
            if ($pedido && $mappedStatus !== $pedido['status']) {
                $updateStmt = $db->prepare("UPDATE pedidos SET status = :status, updated_at = :updated_at WHERE transaction_id = :transaction_id");
                $updateStmt->execute([
                    'status' => $mappedStatus,
                    'updated_at' => date('c'),
                    'transaction_id' => $id
                ]);
                error_log("[SKALEPAY-Verificar] ✅ Status atualizado: {$pedido['status']} -> $mappedStatus");
            }

            echo json_encode([
                'success' => true,
                'status' => $mappedStatus,
                'transaction_id' => $id,
                'source' => 'api',
                'api_status' => $apiStatus,
                'data' => [
                    'amount' => $apiResult['amount'] ?? ($pedido['valor'] ?? 0),
                    'created_at' => $apiResult['createdAt'] ?? ($pedido['created_at'] ?? null),
                    'updated_at' => $apiResult['updatedAt'] ?? date('c'),
                    'paid_at' => $apiResult['paidAt'] ?? null,
                    'customer' => [
                        'name' => $apiResult['customer']['name'] ?? ($pedido['nome'] ?? 'Cliente'),
                        'email' => $apiResult['customer']['email'] ?? ($pedido['email'] ?? 'email@exemplo.com'),
                        'document' => $apiResult['customer']['document']['number'] ?? ($pedido['cpf'] ?? '')
                    ]
                ]
            ]);

        } else {
            error_log("[SKALEPAY-Verificar] ❌ Resposta inválida da API");
            
            // Fallback para dados locais
            if ($pedido) {
                echo json_encode([
                    'success' => true,
                    'status' => $pedido['status'],
                    'transaction_id' => $pedido['transaction_id'],
                    'source' => 'local_fallback',
                    'data' => [
                        'amount' => $pedido['valor'],
                        'created_at' => $pedido['created_at'],
                        'updated_at' => $pedido['updated_at'],
                        'customer' => [
                            'name' => $pedido['nome'],
                            'email' => $pedido['email'],
                            'document' => $pedido['cpf']
                        ]
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Resposta inválida da API e pedido não encontrado localmente'
                ]);
            }
        }
    } else if ($httpCode === 404) {
        error_log("[SKALEPAY-Verificar] ❌ Transação não encontrada na API");
        echo json_encode([
            'success' => false,
            'status' => 'not_found',
            'message' => 'Transação não encontrada'
        ]);
    } else {
        error_log("[SKALEPAY-Verificar] ❌ Erro na API: HTTP " . $httpCode);
        
        // Fallback para dados locais
        if ($pedido) {
            echo json_encode([
                'success' => true,
                'status' => $pedido['status'],
                'transaction_id' => $pedido['transaction_id'],
                'source' => 'local_fallback',
                'data' => [
                    'amount' => $pedido['valor'],
                    'created_at' => $pedido['created_at'],
                    'updated_at' => $pedido['updated_at'],
                    'customer' => [
                        'name' => $pedido['nome'],
                        'email' => $pedido['email'],
                        'document' => $pedido['cpf']
                    ]
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'Erro na API e pedido não encontrado localmente'
            ]);
        }
    }

} catch (Exception $e) {
    error_log("[SKALEPAY-Verificar] ❌ Erro: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Erro ao verificar o status do pagamento'
    ]);
} 
?>

