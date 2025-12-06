# 📚 Sistema Inteligente de Gestión de Dependencias

Guía completa del sistema automatizado con IA que ahorra 70% de tiempo en actualizaciones.

---

## 🎯 Resumen Ejecutivo

**Antes:** Revisar manualmente 10 PRs cada semana (20 min)
**Ahora:** Sistema inteligente que:
- 🟢 Auto-mergea updates seguros (0 min)
- 🟡 IA revisa updates medianos (4-6 min)
- 🔴 Convierte major updates a issues (cuando tengas tiempo)

**Resultado:** 70% menos tiempo, PRs más limpios, updates más seguros.

---

## 🤖 ¿Qué es Dependabot?

**Dependabot** es un bot de GitHub que:
- Revisa tus dependencias (package.json)
- Detecta actualizaciones disponibles
- Crea Pull Requests automáticamente
- **NUEVO:** Los PRs se procesan automáticamente según riesgo

**NO hace cambios directos al código**. Solo crea PRs que el sistema evalúa y procesa inteligentemente.

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

## 🚀 Workflows Configurados (4 Workflows Inteligentes)

### 1. **dependabot-auto-review.yml** (Evaluación Básica)

**Se activa:** Cada vez que Dependabot crea un PR

**Qué hace:**
1. Analiza el tipo de actualización (major/minor/patch)
2. Evalúa el riesgo (Low/Medium/High)
3. Detecta si es paquete crítico
4. Agrega labels automáticos
5. Crea un comentario con checklist básico

**NO necesita configuración**. Funciona solo.

---

### 2. **dependabot-smart-review.yml** ⭐ NUEVO (Routing Inteligente)

**Se activa:** Cada vez que Dependabot crea un PR

**Qué hace según el riesgo:**

#### 🟢 RIESGO BAJO (patch + dev dep)
```
Ejemplo: eslint 8.1.0 → 8.1.1

Acción:
- Comenta: "Seguro para auto-merge"
- Se activa el workflow #4 (auto-merge)
- Se mergea solo cuando el build pasa ✅
```

#### 🟡 RIESGO MEDIO (minor o patch prod)
```
Ejemplo: @radix-ui/dialog 1.1.0 → 1.2.0

Acción:
- Auto-ejecuta `/gemini review` (sin que comentes!)
- IA analiza los cambios
- VOS decidís si mergear basándote en el análisis
```

#### 🔴 RIESGO ALTO (major updates)
```
Ejemplo: next 15.0.0 → 16.0.0

Acción:
1. Crea un GitHub Issue con:
   - Checklist de migración
   - Links al changelog
   - Breaking changes
   - Plan de upgrade
2. Cierra el PR automáticamente
3. Te notifica: "Issue #XXX creado"
```

**¿Por qué Issues para major updates?**
- ✅ No ocupan espacio en la lista de PRs
- ✅ Podés planificar la migración tranquilo
- ✅ Discutir estrategia en comentarios
- ✅ Asignar a miembros del equipo
- ✅ Agregar a milestones (ej: "Migraciones Q1 2026")
- ✅ Imposible mergear accidentalmente

---

### 3. **gemini-code-assist.yml** ⭐ MEJORADO (Review con IA Real)

**Se activa:**
- Manual: Cuando comentás `/gemini review` en un PR
- **Auto:** El workflow #2 lo ejecuta para PRs de riesgo medio

**Qué hace:**
1. Lee el diff del PR (primeros 10KB)
2. Envía a **Gemini 1.5 Flash** (IA de Google)
3. IA analiza según las reglas de CLAUDE.md:
   - 🔒 Seguridad (auth, validación, cookies)
   - ⚡ Performance (Prisma queries, caching)
   - 🚨 Error handling (ApiHandler, logging)
   - 🎨 Code style (ESLint, TypeScript)
   - 🏗️ Arquitectura (Server Actions, Services)
4. Postea análisis detallado con recomendaciones

**Setup (REQUERIDO para IA):**
1. Andá a [Google AI Studio](https://aistudio.google.com/)
2. Creá una API key (gratis, sin tarjeta)
3. Agregála en GitHub:
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `GEMINI_API_KEY`
   - Value: tu-api-key
4. ¡Listo! Ya funciona automáticamente

**Fallback:** Si no configurás la API key, muestra un checklist manual.

---

### 4. **dependabot-auto-merge.yml** ⭐ NUEVO (Auto-Merge Seguro)

**Se activa:** Cuando todos los checks pasan en PRs de RIESGO BAJO

**Requisitos de seguridad:**
- ✅ SOLO updates PATCH (x.x.1 → x.x.2)
- ✅ SOLO dev dependencies
- ✅ Build de Vercel pasó sin errores
- ✅ NO es paquete crítico (next, prisma, etc.)
- ✅ NO tiene conflictos de merge

**Cómo funciona:**
1. Workflow #2 marca el PR como RIESGO BAJO
2. Este workflow espera a que pasen TODOS los checks
3. Aprueba el PR automáticamente
4. Mergea con squash commit
5. Postea resumen con SHA para revertir si es necesario

**Override (Prevenir auto-merge):**
- Agregá el label `skip-auto-merge` al PR
- O comentá "hold" en el PR

**Rollback:**
```bash
git revert <sha-del-commit>
```
(El SHA se incluye en el comentario del merge)

---

## 🎯 Tu Nuevo Workflow (Automatizado)

### Lunes a las 9 AM (100% automático):

```
Dependabot detecta 8 actualizaciones:

├─ 3 PRs LOW RISK (patch dev deps)
│  → Auto-review comenta
│  → Build de Vercel se ejecuta
│  → Pasan todos los checks
│  → Auto-merge los mergea en ~3 min ✅
│  → VOS NO HACÉS NADA

├─ 2 PRs MEDIUM RISK (minor updates)
│  → Auto-review comenta
│  → Smart Review ejecuta `/gemini review` automáticamente
│  → IA postea análisis detallado
│  → ESPERAN TU DECISIÓN 👀

├─ 3 Issues MAJOR UPDATES (next, react, tailwind)
│  → PRs cerrados automáticamente
│  → Issues creados con checklist de migración
│  → REVISÁS CUANDO TENGAS TIEMPO 📋

Resultado:
- 3 PRs auto-merged (0 min) ✅
- 2 PRs con AI review (esperan tu review) 📊
- 3 Issues para planificar (sin apuro) 🎟️
```

### Tu Acción Semanal (4-6 min):

**Solo necesitás revisar 2-3 PRs MEDIUM RISK:**

1. Vas a GitHub → Pull Requests
2. Ves 2-3 PRs (los LOW ya están merged!)
3. Leés el análisis de IA que ya está posteado
4. Decisión rápida:
   - IA dice "looks good" + build pasó → Mergear ✅
   - IA encuentra issues → Investigar o cerrar ❌

**Issues de major updates:**
- Los revisás cuando tengas tiempo
- Podés asignarlos a miembros del equipo
- Agregarlos a milestones
- Discutir estrategia en comentarios

### Ejemplo Real del Lunes:

```
9:00 AM - Dependabot escanea
9:05 AM - Crea 8 updates

PR #1: eslint patch (dev) 🟢
  → 9:08 AM: Build pasa
  → 9:10 AM: Auto-merged ✅

PR #2: prettier patch (dev) 🟢
  → 9:09 AM: Build pasa
  → 9:11 AM: Auto-merged ✅

PR #3: @types/node patch 🟢
  → 9:10 AM: Build pasa
  → 9:12 AM: Auto-merged ✅

PR #4: @radix-ui/dialog minor 🟡
  → 9:15 AM: IA postea review
  → ESPERANDO TU REVIEW

PR #5: zod patch (prod) 🟡
  → 9:16 AM: IA postea review
  → ESPERANDO TU REVIEW

Issue #1: next 15→16 (major) 🔴
  → PR cerrado
  → Issue con checklist
  → CUANDO TENGAS TIEMPO

Issue #2: tailwind 3→4 (major) 🔴
  → PR cerrado
  → Issue con migration guide
  → CUANDO TENGAS TIEMPO

Issue #3: react 18→19 (major) 🔴
  → PR cerrado
  → Issue con breaking changes
  → CUANDO TENGAS TIEMPO
```

**Tu intervención:**
- 10:00 AM: Revisás PR #4 y #5 (4 min)
- Mergeás los que la IA aprobó
- ¡Listo para toda la semana!

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

## 🚀 Setup Inicial (2 minutos)

### Paso 1: Activar IA Reviews (Opcional pero recomendado)

1. Andá a [Google AI Studio](https://aistudio.google.com/)
2. Creá una cuenta (gratis, sin tarjeta)
3. Generá una API key
4. En GitHub:
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `GEMINI_API_KEY`
   - Value: <tu-api-key>

### Paso 2: Activar Auto-Merge (Requerido para workflow #4)

1. **Habilitar auto-merge:**
   - Settings → General → Pull Requests
   - ✅ Allow auto-merge

2. **Permisos de workflows:**
   - Settings → Actions → General → Workflow permissions
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### Paso 3: ¡Listo!

El próximo lunes a las 9 AM, el sistema empieza a funcionar solo.

---

## 🎯 Recomendaciones

### Para monitorear la primera semana:

1. **Lunes 9 AM**: Chequeá que los workflows se ejecuten
2. **10 AM**: Revisá los PRs que quedaron (solo los MEDIUM)
3. **Verificá** que los LOW risk se auto-mergearon correctamente
4. **Mirá** los Issues creados para major updates

### Ajustes opcionales:

**Si querés menos PRs simultáneos:**
```yaml
# .github/dependabot.yml
open-pull-requests-limit: 5  # En vez de 10
```

**Si te abruma (ejecutar mensualmente):**
```yaml
schedule:
  interval: "monthly"
```

**Si querés deshabilitar auto-merge temporalmente:**
```yaml
# Agregá este label a los PRs:
skip-auto-merge
```

---

## ❓ Preguntas Frecuentes Actualizadas

### ¿Qué pasa si el auto-merge rompe algo?

1. **Vercel detecta** errores en deploy
2. **Rollback inmediato** en Vercel (1 click)
3. **O revertí el commit:**
   ```bash
   git revert <sha>
   ```
4. Agregá `skip-auto-merge` label para futuros PRs de ese paquete

### ¿Puedo confiar en el auto-merge?

Sí, porque:
- ✅ SOLO patch dev deps (bug fixes solamente)
- ✅ NUNCA critical packages (next, prisma, etc.)
- ✅ NUNCA major/minor updates
- ✅ Build debe pasar primero
- ✅ Podés revertir en segundos

### ¿Qué hago con los Issues de major updates?

- **No tienen apuro** - Son para planificar
- Podés:
  - Asignarlos a miembros del equipo
  - Agregarlos a milestones
  - Etiquetar como `blocked`, `needs-research`
  - Discutir estrategia de migración
- Cuando estés listo:
  - Creás un branch nuevo
  - Hacés la migración
  - Creás un PR dedicado
  - El issue queda como documentación

### ¿Puedo deshabilitar workflows individualmente?

Sí, en `.github/workflows/<nombre>.yml`:
```yaml
# Comentá o borrá el workflow que no quieras
```

O deshabilitá desde:
- Actions → Workflows → <workflow> → Disable workflow

---

**¿Más dudas?** Revisá el [README.md](.github/README.md) (documentación completa en inglés)
