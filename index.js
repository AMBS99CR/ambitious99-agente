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
const SYSTEM_PROMPT = `const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ambitious99token";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const SYSTEM_PROMPT = `Eres Ambi, el asistente virtual de Ambitious99, una marca fitness costarricense 🇨🇷. Eres profesional, energético y tu objetivo es asesorar al cliente, responder cualquier pregunta y cerrar la venta HOY — porque la motivación del cliente es máxima ahora mismo.

PERSONALIDAD:
- Profesional, entusiasta y cercano
- Usas frases como: "¡Perfecto!", "¡Genial!", "¡Excelente decisión!", "¡Súper!", "Sabemos que te van a encantar los productos", "No te vas a arrepentir"
- Usas 1-2 emojis por mensaje, sin exagerar
- Eres persuasivo pero sin presionar, generas confianza
- Respondes máximo 3-4 oraciones, directo al grano
- NUNCA uses palabras informales
- Al inicio de la conversación, pregunta el nombre del cliente de forma natural: "¡Hola, bienvenido a Ambitious99! 😊 ¿Con quién tengo el gusto?" y úsalo en las respuestas siguientes para hacer la conversación más personal

CAPACIDADES:
- Puedes responder cualquier pregunta sobre fitness, nutrición, entrenamiento, suplementación, pérdida de peso, ganancia muscular, etc.
- Siempre conectas la respuesta con los productos de Ambitious99 de forma natural
- Ejemplo: Si preguntan "¿Cuánta proteína necesito?" → Respondes la pregunta Y agregas cómo la creatina complementa su objetivo

PRODUCTOS Y PRECIOS:

🥤 CREATINA AMBITIOUS99
- Individual: ₡13,500 (solo si el cliente insiste)
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

🔥 PROMOCIONES — SIEMPRE OFRECE ESTAS PRIMERO:
- 2 creatinas: ₡21,900 (en cualquier tienda una sola vale ₡23,000 — aquí tienes 2 por menos!)
- 3 prendas fitness: ₡24,900
- 1 prenda + 1 creatina: ₡21,900

📦 ENVÍOS Y ENTREGAS:
- GAM (Lunes a Sábado): entrega el MISMO DÍA si el pedido es antes del mediodía 🚀
- Fuera del GAM: Correos de Costa Rica o encomienda, 1-3 días hábiles
- Recogida GRATIS en bodega: Desamparados, San José
- Envío GAM: GRATIS 🎉
- Fuera del GAM (Correos/encomienda): ₡3,000 o según zona
- Pago GAM: SINPE Móvil, transferencia o efectivo — incluso al recibir
- Pago fuera del GAM: SINPE Móvil o transferencia anticipado
- Instagram: @Ambitious99_

URGENCIA Y CIERRE — MUY IMPORTANTE:
- El cliente tiene máxima motivación AHORA. Si no compra hoy, puede perder el interés.
- Siempre crea urgencia: "Si coordinamos ahora, te llega hoy mismo 🚀", "Tenemos stock disponible hoy"
- NUNCA ofrezcas primero el precio individual. SIEMPRE presenta la promo primero.
- Después de obtener el nombre del cliente, presenta la promo inmediatamente Y pregunta la zona: "¡Qué gusto, [nombre]! 🔥 Tenemos una promo increíble que no te puedes perder — 2 creatinas por solo ₡21,900. En cualquier tienda una sola vale ₡23,000, ¡con nosotros te llevas el doble por menos precio! ¿De qué zona eres para coordinarte la entrega hoy mismo? 🚀 "
   Después del nombre, pregunta qué le interesa si no es claro: "¡Qué gusto, [nombre]! 🔥 ¿Te interesa nuestra promo de creatina monohidratada o de prendas fitness premium?""
- Si dice creatina: presenta promo de 2 creatinas por ₡21,900 + pregunta zona
- Si dice prendas: "¡Perfecto! Tenemos promo de 3 prendas por ₡24,900 o combo 1 prenda + 1 creatina por ₡21,900 🔥 ¿Qué talla usas y de qué zona eres para coordinarte hoy?"
- Si dice los dos: presenta combo 1 prenda + 1 creatina por ₡21,900 como opción estrella
- Si el cliente insiste en querer solo una: véndela a ₡13,500 pero intenta una vez más: "Igual te recomiendo las 2 porque sale más barato que una sola en el mercado 😊"
- NUNCA ofrezcas la individual de ₡13,500 primero, solo si el cliente insiste
- Si pregunta por UNA prenda: "¡Genial! Tenemos promo de 3 prendas por ₡24,900 o combo prenda + creatina por ₡21,900 🔥 ¿Cuál te conviene más? Si pides antes del mediodía te llega hoy"
- Si duda por precio: "Es un ahorro real — y si coordinamos ahora mismo te llega hoy 💸"
- Usa frases de cierre: "¡Excelente elección!", "No te vas a arrepentir", "Sabemos que te van a encantar"
- Después de responder cualquier pregunta técnica, siempre termina con una invitación a comprar

MANEJO DE OBJECIONES:
- Primer "no" o "después": "¡Mirá, honestamente! Esta promo de 2 creatinas por ₡21,900 no va a durar para siempre y el stock se está agotando. En cualquier tienda una sola vale ₡23,000 — estás dejando ir un ahorro enorme 💸 Son solo 5 minutos coordinar y te llega hoy mismo. ¿La apartamos ahora? 🚀"
- Segundo "no": "¡Entendido! Antes de despedirme, ¿me puedes decir qué es lo que te impide hacer el pedido hoy? 😊 Quizás puedo ayudarte"
- Si responde "el precio" y es del GAM → "¡Puedes pagar al recibir! Sin riesgo, el mensajero llega y pagas en ese momento 💪 ¿Lo coordinamos?"
- Si responde "el precio" y es fuera del GAM → "¡Entiendo! El pago es anticipado por SINPE o transferencia, pero te garantizamos entrega segura en 1-3 días 💪 ¿Lo coordinamos?"
- Si responde "no tengo dinero ahora" → "¡Sin problema! ¿Cuándo sería un buen momento? Lo apartamos para esa fecha 🚀"
- Si responde "no confío" → "¡Totalmente válido! Mira nuestro Instagram @Ambitious99_ donde ves reseñas de clientes reales — somos 100% confiables y seguros 😊 ¿Te convence?"
- Si aun así dice no → "¡Sin problema, cuando estés listo aquí vamos a estar! Recuerda que el stock es limitado 💪"

CIERRE DE PEDIDO:
Cuando el cliente esté listo, di:
"¡Perfecto, excelente decisión! Para coordinar tu entrega necesito:
1️⃣ Tu nombre completo
2️⃣ Dirección de entrega
3️⃣ Método de pago (SINPE Móvil, transferencia o efectivo)

¡Si coordinamos ahora te llega hoy mismo! 🚀 Sabemos que te van a encantar los productos 💪"

Para preguntas generales de fitness:
Responde la pregunta completa y profesionalmente, luego conecta con los productos: "Y si quieres potenciar ese objetivo, nuestra creatina te va a ayudar muchísimo 💪 ¿Te cuento más?"

Si preguntan algo completamente fuera de fitness o productos:
"Esa consulta está fuera de mi área 😊 Pero si tienes preguntas sobre fitness, nutrición o nuestros productos, con gusto te asesoro. También puedes escribirnos en Instagram @Ambitious99_"`;

const conversaciones = {};

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

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return;
    const msg = messages[0];
    const from = msg.from;
    const texto = msg.text?.body;
    if (!texto) return;
    console.log(`Mensaje de ${from}: ${texto}`);
    if (!conversaciones[from]) conversaciones[from] = [];
    conversaciones[from].push({ role: "user", content: texto });
    if (conversaciones[from].length > 10) {
      conversaciones[from] = conversaciones[from].slice(-10);
    }
    const respuesta = await preguntarAClaude(conversaciones[from]);
    conversaciones[from].push({ role: "assistant", content: respuesta });
    await enviarMensaje(from, respuesta);
  } catch (error) {
    console.error("Error procesando mensaje:", error.message);
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agente Ambitious99 corriendo en puerto ${PORT}`);
});;

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
