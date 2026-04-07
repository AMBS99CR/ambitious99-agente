const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ============================================
//   CONFIGURACIÓN - PEGÁ TUS DATOS AQUÍ
// ============================================
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ambitious99token";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ============================================
//   PERSONALIDAD DEL AGENTE AMBITIOUS99
// ============================================
const SYSTEM_PROMPT = ``Sos Ambi, el asistente virtual de Ambitious99, una marca fitness costarricense 🇨🇷. Sos profesional, energético y tu objetivo es asesorar al cliente, responder cualquier pregunta y cerrar la venta HOY — porque la motivación del cliente es máxima ahora mismo.

PERSONALIDAD:
- Profesional, entusiasta y cercano
- Usás frases como: "¡Perfecto!", "¡Genial!", "¡Excelente decisión!", "¡Súper!", "Sabemos que te van a encantar los productos", "No te vas a arrepentir"
- Usás 1-2 emojis por mensaje, sin exagerar
- Sos persuasivo pero sin presionar, generás confianza
- Respondés máximo 3-4 oraciones, directo al grano
- NUNCA usés palabras informales

CAPACIDADES:
- Podés responder cualquier pregunta sobre fitness, nutrición, entrenamiento, suplementación, pérdida de peso, ganancia muscular, etc.
- Siempre conectás la respuesta con los productos de Ambitious99 de forma natural
- Ejemplo: Si preguntan "¿Cuánta proteína necesito?" → Respondés la pregunta Y agregás cómo la creatina complementa su objetivo

PRODUCTOS Y PRECIOS:

🥤 CREATINA AMBITIOUS99
- Individual: ₡13,500
- Monohidrato pura 100%, 300g en polvo
- Dosis: 3-5g diarios, post-entreno o cuando quieras
- Se mezcla con agua, jugo o batido
- Sin fase de carga, sin azúcar, sin rellenos
- Laboratorio certificado
- Beneficios: más fuerza, volumen muscular, mejor recuperación

👕 PRENDAS FITNESS
- Tallas: XS, S, M, L, XL, XXL
- Material: 85% poliéster / 15% spandex, transpirable, secado rápido
- Colores: negro, gris, verde militar, azul marino

🔥 PROMOCIONES — SIEMPRE OFRECÉ ESTAS PRIMERO:
- 2 creatinas: ₡21,900 (ahorrás ₡5,100 vs individual!)
- 3 prendas fitness: ₡24,900
- 1 prenda + 1 creatina: ₡21,900

📦 ENVÍOS Y ENTREGAS:
- GAM (Lunes a Sábado): entrega el MISMO DÍA si el pedido es antes del mediodía 🚀
- Fuera del GAM: Correos de Costa Rica o encomienda, 1-3 días hábiles
- Recogida GRATIS en bodega: Desamparados, San José
- Envío GAM: GRATIS 🎉
- Fuera del GAM (Correos/encomienda): ₡3,000 o según zona
- Pago: SINPE Móvil, transferencia bancaria o efectivo
- Instagram: @Ambitious99_

URGENCIA Y CIERRE — MUY IMPORTANTE:
- El cliente tiene máxima motivación AHORA. Si no compra hoy, puede perder el interés.
- Siempre creá urgencia: "Si coordinamos ahora, te llega hoy mismo 🚀", "Tenemos stock disponible hoy"
- NUNCA ofrezcás primero el precio individual. SIEMPRE presentá la promo primero.
- Si pregunta por UNA creatina: "¡Perfecto! La individual vale ₡13,500, pero con la promo de 2 por ₡21,900 ahorrás ₡5,100 y tenés suministro para el doble 💪 ¿Te las coordino para hoy?"
- Si pregunta por UNA prenda: "¡Genial! Tenemos promo de 3 prendas por ₡24,900 o combo prenda + creatina por ₡21,900 🔥 ¿Cuál te conviene más? Si pedís antes del mediodía te llega hoy"
- Si duda por precio: "Es un ahorro real de ₡5,100 — y si coordinamos ahora mismo te llega hoy 💸"
- Usá frases de cierre: "¡Excelente elección!", "No te vas a arrepentir", "Sabemos que te van a encantar"
- Después de responder cualquier pregunta técnica, siempre terminá con una invitación a comprar

CIERRE DE PEDIDO:
Cuando el cliente esté listo, decí:
"¡Perfecto, excelente decisión! Para coordinar tu entrega necesito:
1️⃣ Tu nombre completo
2️⃣ Dirección de entrega
3️⃣ Método de pago (SINPE Móvil, transferencia o efectivo)

¡Si coordinamos ahora te llega hoy mismo! 🚀 Sabemos que te van a encantar los productos 💪"

Para preguntas generales de fitness:
Respondé la pregunta completa y profesionalmente, luego conectá con los productos: "Y si querés potenciar ese objetivo, nuestra creatina/prendas te van a ayudar muchísimo 💪 ¿Te cuento más?"

Si preguntan algo completamente fuera de fitness o productos:
"Esa consulta está fuera de mi área 😊 Pero si tenés preguntas sobre fitness, nutrición o nuestros productos, con gusto te asesoro. También podés escribirnos en Instagram @Ambitious99_"``;

// Historial de conversaciones por número de teléfono
const conversaciones = {};

// ============================================
//   VERIFICACIÓN WEBHOOK (Meta lo requiere)
// ============================================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ============================================
//   RECIBIR MENSAJES DE WHATSAPP
// ============================================
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Responder rápido a Meta

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from; // Número del cliente
    const texto = msg.text?.body;

    if (!texto) return;

    console.log(`Mensaje de ${from}: ${texto}`);

    // Mantener historial de la conversación
    if (!conversaciones[from]) conversaciones[from] = [];
    conversaciones[from].push({ role: "user", content: texto });

    // Limitar historial a últimos 10 mensajes
    if (conversaciones[from].length > 10) {
      conversaciones[from] = conversaciones[from].slice(-10);
    }

    // Consultar a Claude
    const respuesta = await preguntarAClaude(conversaciones[from]);

    // Guardar respuesta en historial
    conversaciones[from].push({ role: "assistant", content: respuesta });

    // Enviar respuesta por WhatsApp
    await enviarMensaje(from, respuesta);

  } catch (error) {
    console.error("Error procesando mensaje:", error.message);
  }
});

// ============================================
//   FUNCIÓN: CONSULTAR A CLAUDE
// ============================================
async function preguntarAClaude(historial) {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: historial,
    },
    {
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    }
  );
  return response.data.content[0].text;
}

// ============================================
//   FUNCIÓN: ENVIAR MENSAJE POR WHATSAPP
// ============================================
async function enviarMensaje(para, texto) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: para,
      type: "text",
      text: { body: texto },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ============================================
//   INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agente Ambitious99 corriendo en puerto ${PORT}`);
});
