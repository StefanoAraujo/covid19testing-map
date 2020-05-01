import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  createStyles,
  Divider,
  IconButton,
  Modal,
  Paper,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import ColorizeIcon from '@material-ui/icons/Colorize';
import PhoneForwardedIcon from '@material-ui/icons/PhoneForwarded';
import ListAltTwoToneIcon from '@material-ui/icons/ListAltTwoTone';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import EventBusyIcon from '@material-ui/icons/EventBusy';
import ReactGA from 'react-ga';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import { labelMap } from '../../App';
import LocationDetails from './LocationDetails';
import LocationActions from './LocationActions';
import { trackUiClick } from '../../utils/tracking';
import ActionType from '../Types/ActionType';
import {convert} from '../../utils/fetchLastUpdated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      maxWidth: '90%',
      width: '600px',
      maxHeight: '90%',
      overflowY: 'auto',
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    detailText: {
      marginLeft: 'auto',
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[500],
    },
    callToAction: {
      borderRadius: '20px',
      width: '100%',
      height: '60px',
      fontSize: '20px',
    },
    grid: {
      flexGrow: 1,
    },
    cardMargin: {
      marginBottom: '16px',
    },
    detailsButton: {
      paddingLeft: '8px',
    },
    cardActions: {
      cursor: 'pointer',
    },
    cardHeader: {
      paddingTop: '0px',
      paddingBottom: '0px',
    },
    cardContent: {
      display: 'flexGrow',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      listStyle: 'none',
      padding: theme.spacing(1.5),
      margin: 10,
    },
    chipRoot: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'top',
      listStyle: 'none',
      padding: theme.spacing(0.5),
      margin: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

interface LocationModalProps {
  location: any;
  onClose: Function;
  showCheckSymptomsFlow: Function;
  runAppointmentFlow: Function;
  filterApplied: boolean;
}

const LocationModal = ({
  location,
  onClose,
  showCheckSymptomsFlow,
  filterApplied,
  runAppointmentFlow,
}: LocationModalProps) => {
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = () => {
    trackUiClick('Location Details', expanded ? 'collapse' : 'expand');
    setExpanded(!expanded);
  };

  const classes = useStyles();

  function handleLinkClicked(locationId: string, action: string): void {
    ReactGA.event({
      category: 'Location',
      action,
      label: locationId,
    });
  }

  function handleCheckSymptomsClicked() {
    showCheckSymptomsFlow(true);
  }
  function loadNextStepButton(locationToRender: any): any {
    let ctaText = '';
    let ctaLink = '';
    let actionType: ActionType;

    if (
      locationToRender.location_contact_url_covid_virtual_visit !== null &&
      locationToRender.location_contact_url_covid_virtual_visit.substring(
        0,
        4
      ) === 'http'
    ) {
      ctaText = 'Start Virtual Visit';
      ctaLink = locationToRender.location_contact_url_covid_virtual_visit;
      actionType = ActionType.Visit;
    } else if (
      locationToRender.is_collecting_samples_by_appointment_only === true &&
      locationToRender.location_contact_url_covid_appointments !== null &&
      locationToRender.location_contact_url_covid_appointments.substring(
        0,
        4
      ) === 'http'
    ) {
      ctaText = 'Book Appointment';
      ctaLink = locationToRender.location_contact_url_covid_appointments;
      actionType = ActionType.WebAppointment;
    } else if (
      locationToRender.is_collecting_samples_by_appointment_only === true &&
      locationToRender.location_contact_phone_covid !== null
    ) {
      ctaText = 'Call for Appointment';
      ctaLink = `tel://${locationToRender.location_contact_phone_covid}`;
      actionType = ActionType.CallAppointment;
    } else if (
      locationToRender.is_collecting_samples_by_appointment_only === true &&
      locationToRender.location_contact_phone_appointment !== null
    ) {
      ctaText = 'Call for Appointment';
      ctaLink = `tel://${locationToRender.location_contact_phone_appointment}`;
      actionType = ActionType.CallAppointment;
    } else {
      ctaText = 'Call Ahead';
      ctaLink = `tel://${locationToRender.location_contact_phone_main}`;
      actionType = ActionType.CallAhead;
    }

    return (
      <Button
        variant="contained"
        size="large"
        color="primary"
        className={classes.callToAction}
        onClick={() => {
          handleLinkClicked(locationToRender.location_id, 'Website Click');
          runAppointmentFlow(actionType, ctaLink);
        }}
      >
        {ctaText}
      </Button>
    );
  }
  const details: any = [];

  Object.keys(labelMap).forEach((key: string) => {
    details.push({
      type: 'boolean',
      title: labelMap[key].card,
      key,
      icon: labelMap[key].icon,
    });
  });

  const address = `${((typeof location.location_address_street === 'string') && !(location.location_address_street.trim().empty)) ? (location.location_address_street.trim()) : ''}`;

  return (
    <Modal
      className={classes.modal}
      onClose={() => onClose()}
      disableAutoFocus
      open
    >
      <Card className={classes.card}>
        <Typography variant="overline" style={{ paddingLeft: '15px',paddingTop: '25px', paddingBottom: '0px', color: 'orange', fontWeight: 'bolder' }}>
          {(location.is_collecting_samples_by_appointment_only === true) ? 'Appointment only ' : 
                'COVID-19 location in ' + location.location_address_locality
          }
        </Typography>
        {/* <Grid item md={3} xs={12}>
            <div
              style={{
                paddingTop: '20px',
              }}
            >
              <span className="fa-layers fa-fw fa-4x" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faCircle} color={indigo[800]} />
                <FontAwesomeIcon
                  icon={renderLocationIcon(
                    location.location_place_of_service_type
                  )}
                  transform="shrink-6"
                  color="white"
                />
              </span>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Chip
                  size="medium"
                  label={getLocationName(
                    location.location_place_of_service_typeZ
                  )}
                  className={classes.typeChip}
                />
              </div>
            </div>
          </Grid> */}
        <CardHeader
          title={location.location_name}
          subheader={address}
          className={classes.cardHeader}
          action={
            <LocationActions
              onLinkClick={handleLinkClicked}
              location={location}
            />
          }
        />

        <CardContent>
          <Typography color="primary" variant="h6" style={{ paddingBottom: '0px' }}>
            {location.location_status}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography color="textPrimary" variant="overline" style={{ paddingBottom: '5px' }}>
            {(location.is_evaluating_symptoms === true) && (location.is_collecting_samples === true) ? 'COVID-19 screening and testing ' : 
              (location.is_evaluating_symptoms === true) && (location.is_collecting_samples === false) ? 'COVID-19 screening in ' :
                (location.is_evaluating_symptoms === false) && (location.is_collecting_samples === true) ? 'COVID-19 screening in ' : 
                  'COVID-19 location in ' + location.location_address_locality
            }
          </Typography>
          {/* <Typography color="textPrimary" paragraph variant="body1"></Typography> */}
          
          <div className={classes.cardContent} style={{ paddingTop: '0px', marginTop: '0px' }}>
            <Paper elevation={0} component="ul" className={classes.chipRoot} >
              <Box component="li" visibility={(location.is_collecting_samples_by_appointment_only === true) ? "visible" : "visible"}>
                <Tooltip 
                  title={(location.is_collecting_samples_by_appointment_only === true) ? "An appointment is required for testing at this location" : "No appointment required (drop-in/walk-in)"}
                  aria-label="appointment"
                  >
                  <Chip 
                    icon={(location.is_collecting_samples_by_appointment_only === true) ? <EventAvailableIcon /> : <EventBusyIcon />}
                    label={(location.is_collecting_samples_by_appointment_only === true) ? "Appointment is required" : "Appointment NOT required"}
                    size= "medium"
                    variant={(location.is_collecting_samples_by_appointment_only === true) ? "default" : "outlined"}
                    color="primary" 
                    className={classes.chip}
                  />
              
                </Tooltip>
              </Box>
              <Box component="li" visibility={(location.is_ordering_tests_only_for_those_who_meeting_criteria === true) ? "visible" : "visible"}>
                <Tooltip 
                  title={(location.is_ordering_tests_only_for_those_who_meeting_criteria === true) ? "Testing only those who meet criteria or have a physician's referral." : "Testing anyone with symptoms (physician referral is NOT required)"}
                  aria-label="referral"
                  >
                  <Chip 
                    icon={(location.is_ordering_tests_only_for_those_who_meeting_criteria === true) ? <HowToRegIcon /> : <NotInterestedIcon />}
                    label={(location.is_ordering_tests_only_for_those_who_meeting_criteria === true) ? "Referral is required" : "Referral NOT required"}
                    size= "medium"
                    variant={(location.is_ordering_tests_only_for_those_who_meeting_criteria === true) ? "default" : "outlined"}
                    color="primary" 
                    className={classes.chip}
                  />
              
                </Tooltip>
              </Box>
              <Box component="li" visibility={(location.is_call_ahead === true) ? "visible" : "visible"}>
                <Tooltip 
                  title={(location.is_call_ahead === true) ? "Call prior to heading to the location" : "No need to call ahead (appointment may still be necessary)"}
                  aria-label="call ahead"
                  >
                  <Chip 
                    icon={(location.is_call_ahead === true) ? <PhoneForwardedIcon /> : <NotInterestedIcon />}
                    label={(location.is_call_ahead === true) ? "Call ahead" : "No need to call ahead"}
                    size= "medium"
                    variant={(location.is_call_ahead === true) ? "default" : "outlined"}
                    color="primary" 
                    className={classes.chip}
                  />
              
                </Tooltip>
              </Box>
              <Box component="li" visibility={(location.is_evaluating_symptoms === true) ? "visible" : "visible"}>
                <Tooltip 
                  title={(location.is_evaluating_symptoms === true) ? "This location offers screening for symptoms of COVID-19" : "This location does NOT offer screening for symptoms of COVID-19"}
                  aria-label="screening"
                  >
                  <Chip 
                    icon={(location.is_evaluating_symptoms === true) ? <ListAltTwoToneIcon /> : <NotInterestedIcon />}
                    label={(location.is_evaluating_symptoms === true) ? "Screening" : "NOT screening" }
                    size= "medium"
                    variant={(location.is_evaluating_symptoms === true) ? "default" : "outlined"}
                    color="primary" 
                    className={classes.chip}
                  />
                </Tooltip>
              </Box>
              <Box component="li" visibility={(location.is_collecting_samples === true) ? "visible" : "visible"}>
                <Tooltip 
                  title={(location.is_collecting_samples === true) ? "This location collects samples to be tested for COVID-19" : "This location does NOT collect samples to be tested for COVID-19"}
                  aria-label="testing"
                  >
                  <Chip 
                    icon={(location.is_collecting_samples === true) ? <ColorizeIcon /> : <NotInterestedIcon />}
                    label={(location.is_collecting_samples === true) ? "Testing" : "NOT Testing" }
                    size= "medium"
                    variant={(location.is_collecting_samples === true) ? "default" : "outlined"}
                    color="primary" 
                    className={classes.chip}
                  />
                </Tooltip>
              </Box>
            </Paper>
          </div>
          
          <Typography color="textPrimary" variant="body2" style={{ paddingBottom: '20px' }}>
            {'For the most current and authoritative information about COVID-19 testing in your area, visit your '}
            <ReactGA.OutboundLink
              eventLabel={'OutboundLink | DPH | ' + location.location_address_locality }
              to={location.reference_publisher_of_criteria}
              target="_blank"
            >
              health department website
            </ReactGA.OutboundLink>
            {'.'}
          </Typography>
          
          <Typography color="textPrimary" variant="caption" style={{ marginBottom: '10px' }}>
            {'\nLast update: ' + convert(location.updated_on) + '\n\n'}
          </Typography>
          
          {filterApplied ? (
            loadNextStepButton(location)
          ) : (
            <Button
              variant="contained"
              size="large"
              color="primary"
              className={classes.callToAction}
              onClick={() => {
                handleCheckSymptomsClicked();
                handleLinkClicked(location.location_id, 'Website Click');
              }}
              style={{ marginTop: '20px', marginBottom: '5px' }}
            >
              Check your Symptoms
            </Button>
          )}
        </CardContent>
        <Divider />
        <CardActions
          onClick={handleExpandClick}
          disableSpacing
          className={classes.cardActions}
        >
          <Typography className={classes.detailsButton}>Details</Typography>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <LocationDetails
          location={location}
          expanded={expanded}
          details={details}
        />
      </Card>
    </Modal>
  );
};

export default LocationModal;
