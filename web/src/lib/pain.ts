import type { PainLevel } from "./types";

export const PAIN_LEVELS: PainLevel[] = [
  {
    emoji: "😄",
    label: { en: "None", es: "Ninguno" },
    desc: { en: "No pain at all", es: "Sin dolor" },
  },
  {
    emoji: "🙂",
    label: { en: "Very mild", es: "Muy leve" },
    desc: { en: "Barely noticeable", es: "Apenas perceptible" },
  },
  {
    emoji: "😊",
    label: { en: "Mild", es: "Leve" },
    desc: { en: "Aware of it, easy to ignore", es: "Lo nota, fácil de ignorar" },
  },
  {
    emoji: "😐",
    label: { en: "Uncomfortable", es: "Incómodo" },
    desc: { en: "Distracts you a little", es: "Le distrae un poco" },
  },
  {
    emoji: "😕",
    label: { en: "Moderate", es: "Moderado" },
    desc: {
      en: "Noticeable but you can function",
      es: "Notable pero puede funcionar",
    },
  },
  {
    emoji: "😟",
    label: { en: "Distracting", es: "Molesto" },
    desc: { en: "Hard to ignore", es: "Difícil de ignorar" },
  },
  {
    emoji: "😣",
    label: { en: "Distressing", es: "Angustiante" },
    desc: { en: "Dominates your senses", es: "Domina sus sentidos" },
  },
  {
    emoji: "😖",
    label: { en: "Intense", es: "Intenso" },
    desc: {
      en: "Physical activity severely limited",
      es: "Actividad física muy limitada",
    },
  },
  {
    emoji: "😫",
    label: { en: "Severe", es: "Severo" },
    desc: {
      en: "Unable to do daily activities",
      es: "No puede hacer actividades diarias",
    },
  },
  {
    emoji: "🤯",
    label: { en: "Worst possible", es: "Lo peor posible" },
    desc: { en: "As bad as it could be", es: "Tan malo como puede ser" },
  },
];
