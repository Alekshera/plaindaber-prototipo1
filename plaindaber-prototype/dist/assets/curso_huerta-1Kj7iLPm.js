import"./modulepreload-polyfill-P2Xu9kJm.js";window.DATA={curso:{id:101,titulo:`Huertas Orgánicas en la Ciudad`,instructor:`María Fernández`,duracion:`15h`,numModulos:6},modulos:[{id:1,titulo:`Introducción a la Agricultura Urbana`,tipo:`induccion`,estado:`completado`,evaluacion:null,contenido:[{tipo:`video`,titulo:`Video: ¿Qué es la agricultura urbana?`,url:`https://www.youtube.com/embed/krwF2PlGkLk`},{tipo:`lectura`,titulo:`Lectura: Conceptos básicos`,cuerpo:`<p>La agricultura urbana comprende el cultivo de alimentos dentro de las ciudades, aprovechando terrazas, balcones y espacios comunitarios.</p><p><strong>Referencia:</strong> FAO - Agricultura urbana y periurbana.</p>`}]},{id:2,titulo:`Preparación del Suelo y Sustratos`,tipo:`actividad_interactiva`,estado:`disponible`,evaluacion:null,contenido:[{tipo:`video`,titulo:`Video: Preparación de sustratos`,url:`https://www.youtube.com/embed/mVxSg1l8UlM`},{tipo:`actividad_interactiva`,titulo:`Actividad interactiva: Arrastrar capas del sustrato`}]},{id:3,titulo:`Siembra y Trasplante`,tipo:`mixto`,estado:`bloqueado`,evaluacion:null,contenido:[{tipo:`lectura`,titulo:`Lectura: Técnicas de siembra`,contenido:`<p>Siembra directa y en semillero: profundidad, densidad y momento del año.</p>`},{tipo:`video`,titulo:`Video: Sembrando en contenedores`,url:`https://www.youtube.com/embed/D15qH3pBmp8`}]},{id:4,titulo:`Riego y Nutrición`,tipo:`quiz`,estado:`bloqueado`,evaluacion:{puntajeMinimo:70,numPreguntas:5,tipo:`Quiz`},contenido:[{tipo:`video`,titulo:`Video: Sistema de riego por goteo`,url:`https://www.youtube.com/embed/shk5iSgKeus`},{tipo:`lectura`,titulo:`Lectura: Nutrición vegetal`,contenido:`<p>Macronutrientes (N-P-K) y su rol en el desarrollo de la planta.</p>`},{tipo:`quiz`,titulo:`Quiz de Riego y Nutrición`,numPreguntas:5}]},{id:5,titulo:`Control de Plagas Ecológico`,tipo:`simulacion_ia`,estado:`bloqueado`,evaluacion:null,contenido:[{tipo:`video`,titulo:`Video: Manejo integrado de plagas`,url:`https://www.youtube.com/embed/mdgDch6UTCg`},{tipo:`simulacion_ia`,titulo:`Simulación IA: Genera un caso de plaga`}]},{id:6,titulo:`Cosecha y Postcosecha`,tipo:`proyecto_practico`,estado:`bloqueado`,evaluacion:{minPuntaje:70,numPreguntas:10,tipo:`Evaluación final`},contenido:[{tipo:`video`,titulo:`Video: Cosecha y manejo postcosecha`,url:`https://www.youtube.com/embed/j6aucWeyG-o`},{tipo:`proyecto_practico`,titulo:`Proyecto práctico: Diseña tu plan de cosecha`}]}]},window.ESTADO_ESTUDIANTE={modulosCompletados:[1],moduloActual:2,progresoGlobal:16};var e=`moduloGlobalActivo`,t={BLOQUEADO:`bloqueado`,DISPONIBLE:`disponible`,COMPLETADO:`completado`},n={bloqueado:`Bloqueado`,disponible:`Disponible`,completado:`Completado`};function r(){return window.DATA.modulos}function i(){let t=localStorage.getItem(e);return t&&r().some(e=>e.id===Number(t))?Number(t):window.ESTADO_ESTUDIANTE.moduloActual||r()[0].id}function a(t){window.ESTADO_ESTUDIANTE.moduloActual=t,localStorage.setItem(e,String(t))}function o(){let e=r().length,n=r().filter(e=>e.estado===t.COMPLETADO).length;return Math.round(n/e*100)}function s(e){switch(e){case t.COMPLETADO:return{icono:`✓`,class:`completado`};case t.DISPONIBLE:return{icono:`▶`,class:`disponible`};default:return{icono:`🔒`,class:`bloqueado`}}}function c(){let e=document.getElementById(`moduleList`),a=i();e.innerHTML=r().map(e=>{let r=s(e.estado),i=e.id===a,o=e.estado===t.BLOQUEADO,c=e.estado===t.DISPONIBLE?`Continuar`:``;return`
            <div class="module-item ${e.estado} ${i?`selected`:``}"
                 data-id="${e.id}"
                 onclick="seleccionarModulo(${e.id})"
                 role="button"
                 tabindex="${o?`-1`:`0`}"
                 aria-label="Módulo ${e.id}: ${e.titulo} (${n[e.estado]})">
                <span class="module-icon ${r.class}">${r.icono}</span>
                <span class="module-title">Módulo ${e.id} · ${e.titulo}</span>
                ${c?`<span class="module-cta">${c} →</span>`:`<span class="module-chevron">›</span>`}
            </div>`}).join(``);let o=document.getElementById(`moduleListCount`);o&&(o.textContent=r().length)}function l(){let e=document.getElementById(`moduleListToggle`),t=document.getElementById(`moduleListWrap`);!e||!t||e.addEventListener(`click`,function(){let n=!t.classList.contains(`hidden`);t.classList.toggle(`hidden`,n),e.classList.toggle(`open`,!n),e.setAttribute(`aria-expanded`,String(!n))})}function u(e){let n=r().find(t=>t.id===e);if(n){if(n.estado===t.BLOQUEADO){alert(`Este módulo está bloqueado. Completa el módulo anterior para desbloquearlo.`);return}a(e),c(),d(n)}}function d(e){let i=document.getElementById(`contentPanel`),a=e.contenido.map(h).join(``);e.estado,t.COMPLETADO;let o=e.estado===t.DISPONIBLE?`<button class="btn btn-primary" id="btnCompletar" onclick="completarModulo(${e.id})"
               aria-label="Marcar el módulo como completado">✔ Marcar como completado</button>`:``,s=f()?`<button class="btn btn-nav" onclick="navegar(-1)">← Anterior</button>`:``,c=p()?`<button class="btn btn-nav" onclick="navegar(1)">Siguiente →</button>`:``;i.innerHTML=`
        <div class="content-card">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 class="section-title text-xl mb-0">Módulo ${e.id}: ${e.titulo}</h2>
                <span class="badge badge-${e.estado}">${n[e.estado]}</span>
            </div>

            ${a||`<p class="text-gray-500">Sin contenido.</p>`}

            <div id="feedback" class="hidden mb-4"></div>

            <div class="flex items-center gap-3 flex-wrap mt-4">
                ${o}
            </div>

            <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                ${s}
                <span class="text-xs text-gray-400">Responderá el módulo ${e.id} / ${r().length}</span>
                ${c}
            </div>
        </div>`}function f(){return m()>0}function p(){let e=m(),n=r()[e+1];return!!n&&n.estado!==t.BLOQUEADO}function m(){return r().findIndex(e=>e.id===i())}function h(e){switch(e.tipo){case`video`:return`
                <div class="content-block">
                    <h4>🎬 ${e.titulo}</h4>
                    <div class="aspect-video w-full">
                        <iframe class="w-full h-full rounded-lg" src="${e.url}"
                            title="${e.titulo}"
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                    </div>
                </div>`;case`lectura`:return`
                <div class="content-block">
                    <h4>📖 ${e.titulo}</h4>
                    <div class="prose text-gray-700 text-sm leading-relaxed">${e.contenido}</div>
                </div>`;case`actividad_interactiva`:return`
                <div class="content-block">
                    <h4>🧩 ${e.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Arrastra cada capa a su posición correcta según el orden del sustrato.</p>
                    <button class="btn btn-primary" onclick="iniciarActividad()">Iniciar actividad</button>
                </div>`;case`simulacion_ia`:return`
                <div class="content-block">
                    <h4>🤖 ${e.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">La IA generará un caso simulado de plaga para que lo diagnostiques.</p>
                    <button class="btn btn-primary" onclick="generarCasoIA()">Generar caso</button>
                </div>`;case`proyecto_practico`:return`
                <div class="content-block">
                    <h4>🛠 ${e.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Diseña tu plan de cosecha y postcosecha y entrégalo para su revisión.</p>
                    <button class="btn btn-primary" onclick="entregarProyecto()">Entregar proyecto</button>
                </div>`;case`quiz`:return`
                <div class="content-block">
                    <h4>📝 ${e.titulo}</h4>
                    <p class="text-sm text-gray-600 mb-3">Completa el módulo para validar tu nota. Requiere un mínimo del 70%.</p>
                </div>`;default:return``}}function g(){alert(`Actividad interactiva iniciada. ¡Completa el arma el sustrato para avanzar!`)}function _(){let e=[`Plaga: pulgón verde en hojas de lechuga. Sujeto: aplicar jabón potasio.`,`Plaga: mosca blanca en plantas de tomate. Sujeto: trampas cromáticas amarillas.`,`Plaga: caracoles nocturnos. Controles: barreras de cobre y humedad controlada.`];alert(`🤖 Caso generado:
`+e[Math.floor(Math.random()*e.length)])}function v(){alert(`🛠 Proyecto entregado. Será revisado por la instructora 🌽 María Fernández.`)}function y(e){let n=m(),i=r(),o=n+e;if(!(o<0||o>=i.length)){if(i[o].estado===t.BLOQUEADO){alert(`Ese módulo está bloqueado. Completa el anterior para desbloquearlo.`);return}a(i[o].id),c(),d(i[o])}}function b(e){let n=r().find(t=>t.id===e);if(!n||n.estado!==t.DISPONIBLE)return;document.getElementById(`feedback`);let i=``;if(n.evaluacion){let e=x(60,100),t=n.evaluacion.minPuntaje||n.evaluacion.puntajeMinimo||70;if(e<t){i=`Tu nota fue ${e}/100 en ${n.evaluacion.tipo}. Necesitas al menos ${t}. Inténtalo de nuevo.`,S(!1,i);return}i=`${n.evaluacion.tipo} superada con una nota de ${e}/100. ¡Bien!`}else i=`Módulo completado correctamente.`;n.estado=t.COMPLETADO,window.ESTADO_ESTUDIANTE.modulosCompletados.push(e);let a=r().findIndex(t=>t.id===e),o=r()[a+1];o&&o.estado===t.BLOQUEADO&&(o.estado=t.DISPONIBLE),C(),c(),d(n),i&&S(!0,i)}function x(e,t){return Math.floor(Math.random()*(t-e+1))+e}function S(e,t){let n=document.getElementById(`feedback`);n.textContent=t,n.classList.remove(`hidden`),n.classList.remove(`error`,`success`),n.classList.add(e?`success`:`error`)}function C(){let e=document.getElementById(`globalProgressBar`),t=document.getElementById(`globalProgressLabel`);if(!e&&!t)return;let n=o();e&&(e.style.width=n+`%`),t&&(t.textContent=n+`%`)}function w(){let e=document.getElementById(`contentPanel`);e.innerHTML=`
        <div class="content-card text-center py-16">
            <div class="text-7xl mb-4">🌱</div>
            <h2 class="text-2xl font-bold text-[#1A3B5C] mb-2">Bienvenido al curso</h2>
            <p class="text-gray-600 max-w-md mx-auto mb-6">Selecciona un módulo disponible de la lista para comenzar tu aprendizaje.</p>
            <button class="btn btn-primary" onclick="seleccionarPrimerDisponible()">Ir al módulo actual</button>
        </div>`}function T(){let e=r(),n=i(),a=e.find(e=>e.id===n&&e.estado!==t.BLOQUEADO)||e.find(e=>e.estado!==t.BLOQUEADO);a&&u(a.id)}document.addEventListener(`DOMContentLoaded`,()=>{C(),c(),l();let e=i(),n=r().find(t=>t.id===e);n&&n.estado!==t.BLOQUEADO?u(e):w()}),window.logout=function(){confirm(`¿Estás seguro de que deseas cerrar sesión?`)&&(window.location.href=`./login.html`)},window.seleccionarModulo=u,window.completarModulo=b,window.navegar=y,window.iniciarActividad=g,window.generarCasoIA=_,window.entregarProyecto=v,window.seleccionarPrimerDisponible=T;