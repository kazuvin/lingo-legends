import { z } from "zod";

export const POS_CODES = {
  Noun: "n",
  Verb: "v",
  Adjective: "a",
  AdjectiveSatellite: "s",
  Adverb: "r",
} as const;

export const LEX_FILE_NUMBERS = {
  AdjAll: 0,
  AdjPert: 1,
  AdvAll: 2,
  NounTops: 3,
  NounAct: 4,
  NounAnimal: 5,
  NounArtifact: 6,
  NounAttribute: 7,
  NounBody: 8,
  NounCognition: 9,
  NounCommunication: 10,
  NounEvent: 11,
  NounFeeling: 12,
  NounFood: 13,
  NounGroup: 14,
  NounLocation: 15,
  NounMotive: 16,
  NounObject: 17,
  NounPerson: 18,
  NounPhenomenon: 19,
  NounPlant: 20,
  NounPossession: 21,
  NounProcess: 22,
  NounQuantity: 23,
  NounRelation: 24,
  NounShape: 25,
  NounState: 26,
  NounSubstance: 27,
  NounTime: 28,
  VerbBody: 29,
  VerbChange: 30,
  VerbCognition: 31,
  VerbCommunication: 32,
  VerbCompetition: 33,
  VerbConsumption: 34,
  VerbContact: 35,
  VerbCreation: 36,
  VerbEmotion: 37,
  VerbMotion: 38,
  VerbPerception: 39,
  VerbPossession: 40,
  VerbSocial: 41,
  VerbStative: 42,
  VerbWeather: 43,
  AdjPpl: 44,
} as const;

export const POINTER_SYMBOLS = {
  Hypernym: "@",
  InstanceHypernym: "@i",
  Hyponym: "~",
  InstanceHyponym: "~i",
  MemberHolonym: "#m",
  SubstanceHolonym: "#s",
  PartHolonym: "#p",
  MemberMeronym: "%m",
  SubstanceMeronym: "%s",
  PartMeronym: "%p",
  Attribute: "=",
  DerivationallyRelatedForm: "+",
  Antonym: "!",
  SimilarTo: "&",
  ParticipleOfVerb: "<",
  Entailment: "*",
  Cause: ">",
  AlsoSee: "^",
  VerbGroup: "$",
  DomainOfSynsetTopic: ";c",
  DomainOfSynsetRegion: ";r",
  DomainOfSynsetUsage: ";u",
  MemberOfThisDomainTopic: "-c",
  MemberOfThisDomainRegion: "-r",
  MemberOfThisDomainUsage: "-u",
  DerivedFromAdjective: "\\",
};

export const wordResponseSchema = z.object({
  id: z.number().int(),
  lemma: z.string(),
  gloss: z.string(),
  posCode: z.enum(POS_CODES),
  lexFileNum: z.enum(LEX_FILE_NUMBERS),
  relations: z.array(
    z.object({
      id: z.number().int(),
      lemma: z.string(),
      pointerSymbol: z.enum(POINTER_SYMBOLS),
      sourceTarget: z.string(),
    }),
  ),
});

export const wordsQuerySchema = z.object({
  ids: z
    .string()
    .transform((val) => val.split(",").map(Number))
    .pipe(z.array(z.number().int()).min(1).max(100)),
});

export const wordsRandomQuerySchema = z.object({
  count: z
    .string()
    .optional()
    .default("10")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

export const wordsRandomResponseSchema = z.object({
  words: z.array(
    z.object({
      id: z.number().int(),
      lemma: z.string(),
      gloss: z.string(),
      posCode: z.enum(POS_CODES),
      lexFileNum: z.enum(LEX_FILE_NUMBERS),
      relations: z.array(
        z.object({
          id: z.number().int(),
          lemma: z.string(),
          pointerSymbol: z.enum(POINTER_SYMBOLS),
          sourceTarget: z.string(),
        }),
      ),
    }),
  ),
  count: z.number().int(),
});

export type wordResponse = z.infer<typeof wordResponseSchema>;
export type wordsQuery = z.infer<typeof wordsQuerySchema>;
export type wordsRandomQuery = z.infer<typeof wordsRandomQuerySchema>;
export type wordsRandomResponse = z.infer<typeof wordsRandomResponseSchema>;
