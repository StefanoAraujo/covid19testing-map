import React, { useEffect } from 'react';
import { Card, createStyles, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { labelMap } from '../App';
import PathwayCard from './PathwayCard';

const useStyles = makeStyles(() =>
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
    responseButton: {
      textTransform: 'none',
      width: '50%',
      marginBottom: '10px',
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
  })
);

interface GatewayModalProps {
  modalShouldOpen: boolean;
  handleYesResponse: Function;
  handleNoResponse: Function;
  handleClose: Function;
}

const GuideModal = ({
  modalShouldOpen,
  handleYesResponse,
  handleNoResponse,
  handleClose,
}: GatewayModalProps) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    setModalOpen(modalShouldOpen);
  }, [modalShouldOpen]);

  function closeModal(response: boolean | null) {
    if (response === null) {
      handleClose();
    } else if (response) {
      handleYesResponse();
    } else {
      handleNoResponse();
    }
    setModalOpen(false);
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
  return (
    <Modal
      className={classes.modal}
      open={modalOpen}
      onClose={() => {
        closeModal(null);
      }}
    >
      <Card className={classes.card}>
        <PathwayCard onResponseClick={closeModal} />
      </Card>
    </Modal>
  );
};

export default GuideModal;
