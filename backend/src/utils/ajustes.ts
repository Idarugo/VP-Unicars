// Valores por defecto de la configuración (se mezclan con lo guardado en la tabla `ajustes`)
export const CONFIG_DEFAULT = {
  empresa: {
    nombre: "VP Unicars",
    rut: "77.535.813-0",
    direccion: "Av. Alberto Einstein 290, Rancagua",
    correo: "vpunicarscl@gmail.com",
    telefono: "+56 9 3023 5194",
  },
  certificacion: {
    uv: "99% de filtro UV",
    documento: "LEHTX00900653 de 20/07/2020 U.S.A.",
    norma: "Norma ISO 3795 test: FM55302:2011",
    decreto:
      "En cumplimiento al Decreto 70-2019 de la Subsecretaría de Transportes, declaro la veracidad de los datos contenidos en este certificado.",
  },
  sistema: {
    folioInicial: 239,
    dominio: "vpunicars.cl",
    venceDominio: "2029-10-13",
    hosting: "Por definir",
    ultimoRespaldo: null as string | null,
  },
};

export type ClaveConfig = keyof typeof CONFIG_DEFAULT;
export const CLAVES_CONFIG = Object.keys(CONFIG_DEFAULT) as ClaveConfig[];
