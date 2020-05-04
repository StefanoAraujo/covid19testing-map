import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { faTasks, faVial } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider } from '@material-ui/core/styles';

import AppBar from './Components/AppBar/AppBar';
import LocationModal from './Components/LocationModal/LocationModal';
import Interstitial from './Components/Interstitial';
import GuideModal from './Components/GuideModal';
import Map from './Components/Map/Map';
import CheckSymptomsFlow from './Components/CheckSymptomsFlow';
import AppointmentFlow from './Components/AppointmentFlow';
import ActionType from './Components/Types/ActionType';
import LabelMapType from './Components/Types/LabelMapType';
import SearchFilterType from './Components/Types/SearchFilterType';

import getViewportHeight from './utils/getViewportHeight';
import theme from './theme';
import { trackGuideStatus } from './utils/tracking';

// Layout Component styles
const LayoutContainer = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

const MapContainer = styled.div`
  flex-basis: 100%;
  flex-grow: 1;
  position: relative;
`;

const AppBarContainer = styled.div`
  z-index: 120;
  position: relative;
`;

// Map for toggles and modal line items
export const labelMap: LabelMapType = {
  is_ordering_tests_only_for_those_who_meeting_criteria: {
    sidebar: 'Tests only those meeting criteria',
    card: 'Testing criteria',
    icon: faTasks,
  },
  is_collecting_samples: {
    sidebar: 'Collects samples for testing',
    card: 'Collects samples',
    icon: faVial,
  },
};

// Initial state
const defaultFilters: SearchFilterType = {
  is_ordering_tests_only_for_those_who_meeting_criteria: false,
  is_collecting_samples: false,
};

export interface GeolocationCoordinates {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export const SearchContext = React.createContext<SearchFilterType>(
  defaultFilters
);
const geocoderContainerRef = React.createRef<any>();

let windowListener: any; // store event handler for resize events
let appointmentFlowUrl = '';
let actionType: ActionType;

const App = () => {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [globalMap, setGlobalMap] = useState<any>([]);
  const [showCheckSymptomsFlow, setShowCheckSymptomsFlow] = useState(false);
  const [showAppointmentFlow, setShowAppointmentFlow] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [filterApplied, setFilterApplied] = useState(false);
  const [fromAssistant, setFromAssistant] = useState(false);

  function toggleGuide() {
    setGuideModalOpen((prevState) => !prevState);
    trackGuideStatus(guideModalOpen);
  }

  function runAppointmentFlow(typeFromButton: ActionType, ctaLink: string) {
    setShowLocationModal(false);
    appointmentFlowUrl = ctaLink;
    actionType = typeFromButton;
    setShowAppointmentFlow(true);
  }

  useEffect(() => {
    windowListener = window.addEventListener('resize', () =>
      setViewportHeight(getViewportHeight())
    );
    setViewportHeight(getViewportHeight());
    return function cleanup() {
      window.removeEventListener('resize', windowListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SearchContext.Provider value={filters}>
        <LayoutContainer style={{ height: viewportHeight }}>
          <GuideModal
            modalShouldOpen={guideModalOpen}
            handleYesResponse={() => {
              setGuideModalOpen(false);
            }}
            handleNoResponse={() => {
              setFromAssistant(true);
              setShowCheckSymptomsFlow(true);
              setGuideModalOpen(false);
            }}
            handleClose={() => {
              setGuideModalOpen(false);
            }}
          />

          <Interstitial />

          <MapContainer>
            <Map
              onClickPin={(place: any) => {
                setSelectedPlace(place);
              }}
              setMap={setGlobalMap}
            />
          </MapContainer>

          {selectedPlace !== null && showLocationModal && (
            <LocationModal
              location={selectedPlace}
              onClose={() => {
                setSelectedPlace(null);
              }}
              showCheckSymptomsFlow={(shouldShowCheckSymptomsFlow: boolean) => {
                if (shouldShowCheckSymptomsFlow) {
                  setShowLocationModal(false);
                  setShowCheckSymptomsFlow(shouldShowCheckSymptomsFlow);
                }
              }}
              runAppointmentFlow={runAppointmentFlow}
              filterApplied={filterApplied}
            />
          )}
          {showCheckSymptomsFlow && (
            <CheckSymptomsFlow
              fromAssistant={fromAssistant}
              location={selectedPlace}
              setFilter={(
                filterKey: keyof SearchFilterType,
                filterValue: boolean
              ) => {
                setFilters((prevState) => {
                  const newState: SearchFilterType = {
                    ...prevState,
                    [filterKey]: filterValue,
                  };
                  if (
                    newState.is_collecting_samples ||
                    newState.is_ordering_tests_only_for_those_who_meeting_criteria
                  ) {
                    setFilterApplied(true);
                  } else {
                    setFilterApplied(false);
                  }
                  return newState;
                });
              }}
              setFlowFinished={() => {
                setShowLocationModal(true);
                setSelectedPlace(null);
                setShowCheckSymptomsFlow(false);
              }}
            />
          )}
          {showAppointmentFlow && (
            <AppointmentFlow
              urlToRender={appointmentFlowUrl}
              actionType={actionType}
              setFlowFinished={() => {
                setShowLocationModal(true);
                setSelectedPlace(null);
                setShowAppointmentFlow(false);
              }}
            />
          )}
          <AppBarContainer>
            <AppBar
              filterApplied={filterApplied}
              geocoderContainerRef={geocoderContainerRef}
              toggleGuide={toggleGuide}
              clearFilters={() => {
                setFilters(defaultFilters);
                setFilterApplied(false);
              }}
              map={globalMap}
            />
          </AppBarContainer>
        </LayoutContainer>
      </SearchContext.Provider>
    </ThemeProvider>
  );
};

export default App;
