"use client";

import { ref, onMounted, onUnmounted } from "vue";

export function useMobile() {
  const isMobile = ref(false);

  const checkIfMobile = () => {
    // Usar una detección más robusta
    isMobile.value =
      window.innerWidth < 768 ||
      (window.matchMedia && window.matchMedia("(max-width: 767px)").matches);

    // Forzar un reflow para asegurar que los cambios se apliquen
    document.body.classList.toggle("is-mobile", isMobile.value);
  };

  onMounted(() => {
    // Verificar inmediatamente
    checkIfMobile();

    // Usar tanto resize como orientationchange para dispositivos móviles
    window.addEventListener("resize", checkIfMobile);
    window.addEventListener("orientationchange", checkIfMobile);

    // También verificar después de un breve retraso para asegurar que todo esté cargado
    setTimeout(checkIfMobile, 100);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkIfMobile);
    window.removeEventListener("orientationchange", checkIfMobile);
    document.body.classList.remove("is-mobile");
  });

  return { isMobile };
}
