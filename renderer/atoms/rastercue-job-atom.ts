import { atom, PrimitiveAtom } from "jotai";
import { RastercueJob } from "@common/rastercue-types";
export const rastercueJobAtom = atom(null as RastercueJob | null) as PrimitiveAtom<RastercueJob | null>;
export const desiredOutputNameAtom = atom("");
