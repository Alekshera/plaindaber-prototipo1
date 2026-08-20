import"./modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  */window.DATA={cursos:[{id:1,titulo:`Introducción a la Lectura del Arhuaco`,descripcion:`Aprende el alfabeto y la fonética básica del idioma ancestral arhuaco.`,areaSaber:`Idiomas`,instructor:`Carlos Pérez`,duracionHoras:12,numModulos:6,estadoInscripcion:`construccion`,progreso:45,imagen:`/plaindaber-prototipo1/Arhuacolandia.jpg`},{id:2,titulo:`Emprende tu Tienda en Línea`,descripcion:`Crea y lanza tu propio comercio electrónico desde cero sin conocimientos previos.`,areaSaber:`Comercio`,instructor:`María Gómez`,duracionHoras:18,numModulos:8,estadoInscripcion:`construccion`,progreso:10},{id:8,titulo:`Fundamentos de Programación`,descripcion:`Introducción a la lógica, algoritmos y estructuras de datos esenciales.`,areaSaber:`Tecnología`,instructor:`Andrés Rodríguez`,duracionHoras:24,numModulos:10,estadoInscripcion:`construccion`,progreso:100},{id:4,titulo:`Cocina Saludable para la Familia`,descripcion:`Recetas nutritivas y técnicas para una alimentación equilibrada.`,areaSaber:`Salud`,instructor:`Lucía Martínez`,duracionHoras:9,numModulos:4,estadoInscripcion:`construccion`,progreso:0},{id:5,titulo:`Historia del Arte Colombiano`,descripcion:`Recorre las corrientes artísticas y sus principales exponentes.`,areaSaber:`Arte`,instructor:`Jorge Torres`,duracionHoras:15,numModulos:7,estadoInscripcion:`construccion`,progreso:100},{id:6,titulo:`Bienes raíces y proyectos inmobiliarios`,descripcion:`Aprende a invertir en propiedades inmobiliarias.`,areaSaber:`Economía`,instructor:`Elena Ruiz`,duracionHoras:8,numModulos:4,estadoInscripcion:`construccion`,progreso:35,imagen:`/plaindaber-prototipo1/inmobiliaria.jpg`},{id:7,titulo:`Fotografía con tu Celular`,descripcion:`Domina la composición, luz y edición básica desde tu móvil.`,areaSaber:`Arte`,instructor:`Andrés Rodríguez`,duracionHoras:10,numModulos:5,estadoInscripcion:`construccion`,progreso:0},{id:3,titulo:`Huertas Orgánicas en la Ciudad`,descripcion:`Cultiva tus propios alimentos en espacios urbanos reducidos.`,areaSaber:`Ecología`,instructor:`Carlos Pérez`,duracionHoras:14,numModulos:6,estadoInscripcion:null,progreso:0,paginaDisponible:!0,imagen:`/plaindaber-prototipo1/Huerta%20Urbana.png`},{id:9,titulo:`Inteligencia Artificial Aplicada`,descripcion:`Usa herramientas de IA para mejorar tu productividad diaria.`,areaSaber:`Tecnología`,instructor:`María Gómez`,duracionHoras:20,numModulos:9,estadoInscripcion:`construccion`,progreso:0}]};var e=document.getElementById(`coursesGrid`),t=document.getElementById(`searchInput`),n=document.getElementById(`areaSelect`),r=document.getElementById(`stateSelect`),i=document.getElementById(`resultsCount`),a=document.getElementById(`emptyState`),o=document.getElementById(`enrollModal`);document.getElementById(`modalCourseName`);var s=document.getElementById(`confirmEnrollBtn`),c=document.getElementById(`cancelEnrollBtn`),l=document.getElementById(`toast`),u=null,d={Idiomas:{color:`#1A3B5C`,icono:`💬`},Comercio:{color:`#7B1FA2`,icono:`🛒`},Tecnología:{color:`#2D5A7B`,icono:`💻`},Salud:{color:`#43A047`,icono:`🌿`},Arte:{color:`#FFB74D`,icono:`🎨`},Economía:{color:`#2E7D32`,icono:`📈`},Ecología:{color:`#43A047`,icono:`🌱`}},f=`#EDE9E1`,p=`#1A3B5C`;function m(){[...new Set([`Comercio`,`Tecnología`,`Salud`,`Arte`,`Idiomas`,`Economía`,`Ecología`,...window.DATA.cursos.map(e=>e.areaSaber)])].sort().forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,n.appendChild(t)});let e={ESTUDIANTE:`Estudiante`,INSTRUCTOR:`Instructor`,ADMINISTRADOR:`Administrador`}[localStorage.getItem(`userRole`)]||`Estudiante`;document.getElementById(`pageSubtitle`).textContent=`Explora y gestiona cursos · ${e}`,t.addEventListener(`input`,h),n.addEventListener(`change`,h),r.addEventListener(`change`,h),c.addEventListener(`click`,b),o.addEventListener(`click`,e=>{e.target===o&&b()}),s.addEventListener(`click`,x),_(window.DATA.cursos)}function h(){let e=t.value.trim().toLowerCase(),i=n.value,a=r.value;_(window.DATA.cursos.filter(t=>{let n=!e||t.titulo.toLowerCase().includes(e)||t.descripcion.toLowerCase().includes(e),r=i===`todas`||t.areaSaber===i,o=!0;return a===`inscrito`?o=t.estadoInscripcion===`en_progreso`||t.estadoInscripcion===`inscrito`:a===`disponible`?o=t.estadoInscripcion===null&&t.paginaDisponible:a===`completado`?o=t.estadoInscripcion===`completado`:a===`construccion`&&(o=!t.paginaDisponible),n&&r&&o}))}function g(e){switch(e.estadoInscripcion){case`completado`:return 2;case`construccion`:return 3;case`inscrito`:case`en_progreso`:return 1;default:return 0}}function _(t){let n=[...t].sort((e,t)=>g(e)-g(t));e.innerHTML=n.map(v).join(``),i.textContent=n.length===1?`Mostrando 1 curso`:`Mostrando ${n.length} cursos`,a.classList.toggle(`hidden`,n.length>0)}function v(e){let t=d[e.areaSaber]||{color:p,icono:`📘`},n=e.estadoInscripcion!==null,r=e.estadoInscripcion===`completado`,i=e.paginaDisponible===!0,a=``;a=i?r?`<button class="w-full py-2 rounded-xl bg-green-100 text-green-700 font-semibold cursor-not-allowed" disabled>
                    ✓ Completado</button>`:e.estadoInscripcion===`inscrito`||e.estadoInscripcion===`en_progreso`?`<button class="w-full py-2 rounded-xl bg-[#7B1FA2] text-white font-semibold hover:bg-[#6A118A] transition"
                        onclick="continuarCurso(${e.id})">Continuar</button>`:`<button class="w-full py-2 rounded-xl border-2 border-[#7B1FA2] text-[#7B1FA2] font-semibold hover:bg-[#7B1FA2] hover:text-white transition"
                        onclick="verCurso(${e.id})">Inscribirse</button>`:`<button class="w-full py-2 rounded-xl bg-gray-200 text-gray-500 font-semibold cursor-not-allowed" disabled
                        title="Próximamente">En Construcción</button>`;let o=t=>t?`<div class="w-full bg-gray-200 rounded-full h-2 mb-4" role="progressbar" aria-valuenow="${e.progreso}" aria-valuemin="0" aria-valuemax="100">
              <div class="bg-[#7B1FA2] h-2 rounded-full transition-all" style="width: ${e.progreso}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mb-4">
                <span>Tu progreso</span><span class="font-semibold text-[#1A3B5C]">${e.progreso}%</span>
            </div>`:``,s=e.estadoInscripcion===`completado`?`<span class="badge bg-green-100 text-green-700">Completado</span>`:e.estadoInscripcion===`construccion`?`<span class="badge bg-gray-200 text-gray-600">En Construcción</span>`:`<span class="badge bg-[#FFD166] text-[#1A3B5C]">Disponible</span>`;return`
        <article class="card overflow-hidden flex flex-col ${i?`hover:-translate-y-1 cursor-pointer`:`opacity-80`}"
                 style="background:${f}"
                 ${i?`onclick="verCurso(${e.id})" role="button" tabindex="0" onkeydown="if(event.key==='Enter') verCurso(${e.id})"`:``}>
            <!-- Portada -->
            ${e.imagen?`<div class="h-40 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                     style="background: linear-gradient(135deg, ${t.color}, ${t.color}cc)">
                       <img src="${e.imagen}" alt="${e.titulo}"
                            class="w-full h-full object-cover"
                            onerror="this.style.display='none'" />
                   </div>`:`<div class="h-40 rounded-xl mb-4 flex items-center justify-center text-white"
                       style="background: linear-gradient(135deg, ${t.color}, ${t.color}cc)">
                       <span class="text-6xl opacity-90">${t.icono}</span>
                   </div>`}

            <!-- Cabecera: título + estado -->
            <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-[#1A3B5C] leading-snug">${e.titulo}</h3>
                ${s}
            </div>

            <!-- Área + instructor -->
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold px-2 py-1 rounded-lg text-white" style="background:${t.color}">${e.areaSaber}</span>
                <span class="text-xs text-gray-600">· ${e.instructor}</span>
            </div>

            <!-- Descripción corta -->
            <p class="text-sm text-gray-600 mb-4">${e.descripcion.length>80?e.descripcion.slice(0,80)+`…`:e.descripcion}</p>

            <!-- Metadatos -->
            <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>📦 ${e.numModulos} módulos</span>
                <span>⏱ ${e.duracionHoras} horas</span>
            </div>

            <!-- Progreso y acción -->
            ${o(n)}
            ${a}
        </article>`}function y(e){window.location.href=`curso_huerta.html?id=${e}`}function b(){o.classList.add(`hidden`),o.classList.remove(`flex`),u=null}function x(){u&&(u.estadoInscripcion=`inscrito`,u.progreso=0,w(`Te inscribiste en "${u.titulo}". ¡Éxitos!`),b(),h())}function S(e){let t=window.DATA.cursos.find(t=>t.id===e);window.location.href=`curso_huerta.html?id=${t.id}`,alert(`Redirigiendo a: curso_huerta.html?id=${t.id} · ${t.titulo}`)}var C=null;function w(e){l.textContent=e,l.classList.remove(`hidden`),clearTimeout(C),C=setTimeout(()=>l.classList.add(`hidden`),3e3)}document.addEventListener(`DOMContentLoaded`,m),window.verCurso=y,window.continuarCurso=S;