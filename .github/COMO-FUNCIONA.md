# 📚 Cómo Funciona la Automatización de Dependabot

Guía completa para entender y usar el sistema de actualización automática de dependencias.

---

## 🤖 ¿Qué es Dependabot?

**Dependabot** es un bot de GitHub que:
- Revisa tus dependencias (package.json)
- Detecta actualizaciones disponibles
- Crea Pull Requests automáticamente
- Te permite aprobar y mergear cuando quieras

**NO hace cambios directos al código**. Solo crea PRs que VOS decidís si aceptar o no.

---

## 📅 ¿Cuándo se ejecuta?

Configuración actual:
```yaml
schedule:
  interval: "weekly"      # Cada semana
  day: "monday"           # Los lunes
  time: "09:00"           # A las 9 AM
  timezone: "America/Argentina/Buenos_Aires"
```

**Importante**: La primera vez que se activa (como pasó hoy), escanea TODAS las dependencias desactualizadas y crea PRs para todas. Después de esto, solo creará PRs para nuevas actualizaciones.

---

## 🔢 ¿Cuántos PRs puede crear?

```yaml
open-pull-requests-limit: 10
```

**Máximo 10 PRs abiertos simultáneamente.**

- Si ya hay 10 PRs abiertos → NO crea más
- Cuando cerrás/mergeás uno → Puede crear otro nuevo
- Podés ajustar este número (te recomiendo 3-5 para menos ruido)

---

## 📦 ¿Qué actualizaciones crea?

### ✅ SÍ actualiza (automáticamente):

**MINOR updates** (1.1.0 → 1.2.0):
- Nuevas funcionalidades
- Sin breaking changes
- Generalmente seguras

**PATCH updates** (1.1.1 → 1.1.2):
- Bug fixes solamente
- 100% compatibles
- Siempre seguras

### ❌ NO actualiza (bloqueadas):

**MAJOR updates** de paquetes críticos:
- `next` (15.x → 16.x) ❌
- `tailwindcss` (3.x → 4.x) ❌
- `prisma` (6.x → 7.x) ❌
- `zod` (3.x → 4.x) ❌
- `better-auth`, `react`, `react-dom` ❌

**¿Por qué?** Estos tienen breaking changes y requieren migración manual.

Configuración:
```yaml
ignore:
  - dependency-name: "next"
    update-types: ["version-update:semver-major"]
```

---

## 🎯 ¿Cómo Revisar los PRs?

### Paso 1: Mirar el Status del Build

Ve a la pestaña "Deployments" en Vercel (como en tu screenshot):

| Status | Significado | ¿Qué hacer? |
|--------|-------------|-------------|
| ✅ **Ready** | Build exitoso | **Seguro para mergear** |
| 🟠 **Building** | Compilando... | **Esperar** |
| ⏸️ **Queued** | En cola | **Esperar** |
| ❌ **Error** | Build falló | **NO mergear** (investigar) |

### Paso 2: Ver el Auto-Review

Cada PR tiene un comentario automático con:
- 🏷️ **Labels**: `major-update`, `minor-update`, `patch-update`
- 📊 **Evaluación de riesgo**: Low/Medium/High
- ✅ **Checklist**: Qué verificar antes de mergear

### Paso 3: Decisión Rápida

```
Build ✅ + PATCH update → Merge SIN REVISAR
Build ✅ + MINOR update → Merge (revisar changelog opcional)
Build ✅ + MAJOR update → REVISAR changelog + probar localmente
Build ❌ → NO MERGEAR
```

---

## 🚀 Workflows Configurados

Tenés **3 workflows** en `.github/workflows/`:

### 1. **dependabot-auto-review.yml** (Automático)

**Se activa:** Cada vez que Dependabot crea un PR

**Qué hace:**
1. Analiza el tipo de actualización (major/minor/patch)
2. Evalúa el riesgo (Low/Medium/High)
3. Detecta si es paquete crítico
4. Agrega labels automáticos
5. Crea un comentario con checklist

**NO necesita configuración**. Funciona solo.

**Ejemplo de comentario:**
```markdown
## 🔧 Dependabot Auto-Review

### Package: `@radix-ui/react-dialog`
Update: 1.1.2 → 1.1.15 (patch)
Type: Production Dependency
Risk Level: LOW RISK - Bug fixes only

### 📋 Review Checklist
- [ ] All CI/CD checks pass
- [ ] Reviewed CHANGELOG
- [ ] Ran `npm run build` locally
```

---

### 2. **gemini-code-assist.yml** (Manual)

**Se activa:** Cuando comentás `/gemini review` en un PR

**Qué hace:**
1. Lee el diff del PR
2. Muestra un checklist detallado basado en CLAUDE.md
3. Valida seguridad, performance, arquitectura

**NO necesita API key** (por ahora). Solo muestra un checklist.

**Cómo usarlo:**
1. Abrís cualquier PR
2. Comentás: `/gemini review`
3. El bot responde con análisis detallado

**Opcional:** Si querés reviews con IA real:
1. Conseguí una API key de [Google AI Studio](https://aistudio.google.com/)
2. Agregála como secret en GitHub: `GEMINI_API_KEY`
3. El workflow la usará automáticamente

---

### 3. **gemini-pr-review.yml** (Automático - OPCIONAL)

**Se activa:** Automáticamente en PRs de Dependabot

**Qué hace:**
1. Similar a `gemini-code-assist.yml`
2. Pero se ejecuta solo (sin comentar `/gemini review`)

**Estado actual:** Requiere credenciales de Google Cloud (complejo).

**Recomendación:** Ignorá este workflow. Usá solo `gemini-code-assist.yml` (manual).

---

## 🎯 Tu Workflow Diario

### Lunes a las 9 AM (automático):

1. **Dependabot** escanea actualizaciones
2. **Crea PRs** (máximo 10)
3. **Vercel** hace build automático de cada PR
4. **Auto-review** comenta en cada PR

### Cuando revisás (manual):

1. Vas a GitHub → Pull Requests
2. Ves los PRs de Dependabot
3. Mirás el status de Vercel:
   - ✅ Ready → Mergear
   - ❌ Error → Cerrar o investigar
4. Opcional: Comentás `/gemini review` para análisis detallado
5. Mergeás los PRs que pasaron el build

### Después de mergear:

1. Dependabot cierra el PR
2. Libera espacio para nuevos PRs
3. La próxima semana, si hay más actualizaciones, crea nuevos PRs

---

## 🔧 Configuración Actual

### Dependabot ([.github/dependabot.yml](.github/dependabot.yml))

```yaml
# Frecuencia
schedule: weekly (lunes 9 AM)

# Límite de PRs
open-pull-requests-limit: 10

# Agrupación
groups:
  - radix-ui (todos los componentes juntos)
  - aws-sdk (todos los paquetes AWS juntos)
  - react-ecosystem
  - typescript-types
  - development-dependencies

# Bloqueados
ignore:
  - next, tailwindcss, prisma, zod, etc. (major updates)
```

---

## 🛠️ Ajustar la Configuración

### ¿Querés menos PRs? (Recomendado)

Editá [.github/dependabot.yml](.github/dependabot.yml):

```yaml
open-pull-requests-limit: 3  # En vez de 10
```

### ¿Querés solo actualizaciones PATCH?

Editá los `groups`:

```yaml
groups:
  production-dependencies:
    update-types:
      - "patch"  # Solo bug fixes, NO features nuevas
```

### ¿Querés revisión mensual en vez de semanal?

```yaml
schedule:
  interval: "monthly"
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué creó 10 PRs de golpe?

Porque es la **primera vez** que se activó. Escaneó todas las dependencias desactualizadas.

**Solución:**
1. Mergeá los PRs que pasaron el build
2. Cerrá los que fallaron
3. Desde ahora solo creará PRs nuevos cuando haya actualizaciones

---

### ¿Cómo sé si es seguro mergear?

**Regla de oro:**
```
Build de Vercel ✅ = Seguro para mergear
Build de Vercel ❌ = NO mergear
```

El build compila todo el proyecto con las nuevas dependencias. Si compila sin errores, es seguro.

---

### ¿Qué pasa si mergeo algo que rompe?

1. Vercel detectará el error en el deploy de producción
2. Podés hacer **rollback** instantáneo en Vercel
3. O hacer `git revert` del commit

**Por eso es importante:** Mirar el build de preview ANTES de mergear.

---

### ¿Puedo mergear directamente sin revisar?

**Sí, si:**
- ✅ Build de Vercel pasó
- ✅ Es una actualización PATCH (x.x.1 → x.x.2)
- ✅ Es una dev dependency

**NO, si:**
- ❌ Build falló
- ❌ Es una actualización MAJOR (1.x → 2.x)
- ❌ Es un paquete crítico (next, prisma, etc.)

---

### ¿Qué hago con los PRs que tienen "Error"?

**Opción 1:** Cerrarlos
- Son actualizaciones que rompen tu código
- No vale la pena arreglarlas ahora

**Opción 2:** Investigar
- Si es un paquete importante, revisar por qué falló
- Puede ser un breaking change que necesites adaptar

---

### ¿Cómo desactivo Dependabot temporalmente?

Ve a: `Settings` → `Security & analysis` → `Dependabot alerts` → Pause

O borrá el archivo `.github/dependabot.yml`

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│  LUNES 9 AM                                                 │
│  ↓                                                          │
│  Dependabot escanea package.json                           │
│  ↓                                                          │
│  Encuentra 15 actualizaciones disponibles                  │
│  ↓                                                          │
│  Crea PRs (máximo 10 por el límite)                        │
└─────────────────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    PR #1         PR #2         PR #3
(PATCH update) (MINOR update) (MINOR update)
        ↓             ↓             ↓
  Vercel Build  Vercel Build  Vercel Build
        ↓             ↓             ↓
      ✅ Ready      ✅ Ready      ❌ Error
        ↓             ↓             ↓
   Auto-Review   Auto-Review   Auto-Review
   "Low Risk"   "Medium Risk"  "High Risk"
        ↓             ↓             ↓
     MERGEAR       MERGEAR        CERRAR
```

---

## 🎯 Recomendación Final

### Para empezar (ahora):

1. **Mergeá los PRs con build ✅ Ready**
2. **Cerrá los PRs con build ❌ Error**
3. **Dejá en queue los que están Building**

### Para el futuro:

1. **Lunes a la mañana**: Revisá los PRs nuevos de Dependabot
2. **Mirás el build**: ✅ = merge, ❌ = cerrar
3. **5 minutos por semana** y listo

### Si te abruma:

Editá `.github/dependabot.yml`:
```yaml
open-pull-requests-limit: 3  # Solo 3 PRs
schedule:
  interval: "monthly"  # Una vez al mes
```

---

**¿Dudas?** Preguntame lo que necesites. Esto es configurable 100%.
