// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import {
//   EstablishmentOption,
//   Mesa,
//   PersonOption,
// } from "../components/types";
// import {
//   getEstablishments,
//   getFilterOptions,
//   getMesasByEstablecimiento,
// } from "../services/internalVoting.service";

// type Props = {
//   canView: boolean;
//   establecimientoId: string;
//   referenteId: string;
//   planilleroId: string;
//   mesaId: string;
//   setMesaId: (value: string) => void;
//   setPlanilleroId: (value: string) => void;
// };

// export function useInternalVotingOptions({
//   canView,
//   establecimientoId,
//   referenteId,
//   planilleroId,
//   mesaId,
//   setMesaId,
//   setPlanilleroId,
// }: Props) {
//   const [establecimientos, setEstablecimientos] = useState<EstablishmentOption[]>([]);
//   const [mesas, setMesas] = useState<Mesa[]>([]);
//   const [referentes, setReferentes] = useState<PersonOption[]>([]);
//   const [planilleros, setPlanilleros] = useState<PersonOption[]>([]);

//   const [loadingEstabs, setLoadingEstabs] = useState(true);
//   const [loadingMesas, setLoadingMesas] = useState(false);
//   const [loadingPersons, setLoadingPersons] = useState(true);

//   useEffect(() => {
//     if (!canView) return;

//     (async () => {
//       try {
//         setLoadingEstabs(true);
//         const items = await getEstablishments();
//         setEstablecimientos(items);
//       } catch (error) {
//         console.error(error);
//         toast.error("No se pudieron cargar los establecimientos");
//       } finally {
//         setLoadingEstabs(false);
//       }
//     })();
//   }, [canView]);

//   useEffect(() => {
//     if (!canView) return;

//     (async () => {
//       try {
//         setLoadingPersons(true);
//         const data = await getFilterOptions(referenteId);
//         setReferentes(data.referentes);
//         setPlanilleros(data.planilleros);
//       } catch (error) {
//         console.error(error);
//         toast.error("No se pudieron cargar los filtros de referente y planillero");
//       } finally {
//         setLoadingPersons(false);
//       }
//     })();
//   }, [canView, referenteId]);
  
//   useEffect(() => {
//     if (planilleroId !== "") {
//       setPlanilleroId("");
//     }
//   }, [referenteId, planilleroId, setPlanilleroId]);

//   useEffect(() => {
//     if (!canView) return;

//     if (!establecimientoId) {
//       setMesas([]);

//       if (mesaId !== "") {
//         setMesaId("");
//       }

//       return;
//     }

//     (async () => {
//       try {
//         setLoadingMesas(true);
//         const items = await getMesasByEstablecimiento(establecimientoId);
//         setMesas(items);
//       } catch (error) {
//         console.error(error);
//         toast.error("No se pudieron cargar las mesas");
//       } finally {
//         setLoadingMesas(false);
//       }
//     })();
//   }, [canView, establecimientoId, mesaId, setMesaId]);

//   return {
//     establecimientos,
//     mesas,
//     referentes,
//     planilleros,
//     loadingEstabs,
//     loadingMesas,
//     loadingPersons,
//   };
// }
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  EstablishmentOption,
  Mesa,
  PersonOption,
} from "../components/types";
import {
  getEstablishments,
  getFilterOptions,
  getMesasByEstablecimiento,
} from "../services/internalVoting.service";

type Props = {
  canView: boolean;
  establecimientoId: string;
  referenteId: string;
  mesaId: string;
  setMesaId: (value: string) => void;
  setPlanilleroId: (value: string) => void;
};

export function useInternalVotingOptions({
  canView,
  establecimientoId,
  referenteId,
  mesaId,
  setMesaId,  
}: Props) {
  const [establecimientos, setEstablecimientos] = useState<EstablishmentOption[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [referentes, setReferentes] = useState<PersonOption[]>([]);
  const [planilleros, setPlanilleros] = useState<PersonOption[]>([]);

  const [loadingEstabs, setLoadingEstabs] = useState(true);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [loadingPersons, setLoadingPersons] = useState(true);

  useEffect(() => {
    if (!canView) return;

    (async () => {
      try {
        setLoadingEstabs(true);
        const items = await getEstablishments();
        setEstablecimientos(items);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los establecimientos");
      } finally {
        setLoadingEstabs(false);
      }
    })();
  }, [canView]);

  useEffect(() => {
    if (!canView) return;

    (async () => {
      try {
        setLoadingPersons(true);
        const data = await getFilterOptions(referenteId);
        setReferentes(data.referentes);
        setPlanilleros(data.planilleros);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los filtros de referente y planillero");
      } finally {
        setLoadingPersons(false);
      }
    })();
  }, [canView, referenteId]);

  useEffect(() => {
    if (!canView) return;

    if (!establecimientoId) {
      setMesas([]);

      if (mesaId !== "") {
        setMesaId("");
      }

      return;
    }

    (async () => {
      try {
        setLoadingMesas(true);
        const items = await getMesasByEstablecimiento(establecimientoId);
        setMesas(items);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las mesas");
      } finally {
        setLoadingMesas(false);
      }
    })();
  }, [canView, establecimientoId, mesaId, setMesaId]);

  return {
    establecimientos,
    mesas,
    referentes,
    planilleros,
    loadingEstabs,
    loadingMesas,
    loadingPersons,
  };
}