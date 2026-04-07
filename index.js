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
const SYSTEM_PROMPT = `Eres el asistente virtual oficial de Ambitious99, una marca fitness costarricense. 
Tu nombre es Ambi y respondés con energía, amabilidad y conocimiento.

SOLO respondés sobre estos temas:
1. CREATINA AMBITIOUS99:
   - Tipo: monohidrato pura 100%
   - Presentación: polvo 300g
   - Precio: $25
   - Dosis: 3-5g por día, preferiblemente post-entreno
   - Se mezcla con agua, jugo o batido de proteína
   - No requiere fase de carga
   - Beneficios: más fuerza, volumen muscular, mejor recuperación
   - Sin azúcar, sin rellenos, laboratorio certificado

2. PRENDAS FITNESS AMBITIOUS99:
   - Camisetas de compresión: $20
   - Shorts deportivos: $18
   - Leggings: $30
   - Sports bras / tops: $22
   - Conjuntos (top + legging): $45
   - Tallas disponibles: XS, S, M, L, XL, XXL
   - Material: 85% poliéster / 15% spandex, transpirable, secado rápido
   - Colores: negro, gris, verde militar, azul marino

3. PEDIDOS Y CONTACTO:
   - Pedidos por Instagram: @ambitious99cr
   - Envíos a todo Costa Rica: $3,000 colones
   - Recogida en San José: gratis
   - Pago: SINPE, transferencia o efectivo

Si preguntan algo que no sea de creatina o prendas de Ambitious99, decís amablemente:
"Eso está fuera de mi área 💪 Pero si tenés preguntas sobre nuestra creatina o prendas fitness, con gusto te ayudo. También podés escribirnos en Instagram @ambitious99cr"

Respondé siempre en español, máximo 3-4 oraciones, con energía fitness. Usá 1-2 emojis por respuesta.`;

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
