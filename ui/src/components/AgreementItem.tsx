import { Trader } from '@daml.js/painter-intermediary';
import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Grid, Icon } from 'semantic-ui-react';
import { userContext } from './App';


type Props = {
  payload: Trader.LabourService.LabourServiceAgreement,
  contractId: string
}

const AgreementItem: React.FC<Props> = ({ payload, contractId }) => {
  const party = userContext.useParty();

  const ledger = userContext.useLedger();
  const [users, setUsers] = useState<{ [key: string]: string }>({}) 

  useEffect(() => {
    ledger.getParties([payload.requirement.owner, payload.provider]).then(([owner, provider]) => {
      setUsers({
        owner: owner?.displayName || payload.requirement.owner,
        provider: provider?.displayName || payload.provider
      })
    })
  }, [ledger, payload.requirement.owner, payload.provider]);
  
  const showFreezeFundsBtn = party === payload.requirement.intermediary && payload.status === 'Pending'
  const handleFreezeFunds = () => {
    ledger.exercise(Trader.LabourService.LabourServiceAgreement.LabourServiceAgreement_FreezeFunds, contractId as any, {})
  }

  const showWorkReadyBtn = party === payload.provider && payload.status === 'Ready_For_Work'
  const handleWorkReady = () => {
    ledger.exercise(Trader.LabourService.LabourServiceAgreement.LabourServiceAgreement_MarkReady, contractId as any, {})
  }

  const showPassReviewButton = party === payload.requirement.owner && payload.status === 'Ready_For_Review'
  const handleReviewPassed = () => {
    ledger.exercise(Trader.LabourService.LabourServiceAgreement.LabourServiceAgreement_MarkReviewed, contractId as any, {})
  }

  const showFinalPaymentButton = party === payload.requirement.intermediary && payload.status === 'Ready_For_Payment'
  const handleFinalPayment = () => {
    ledger.exercise(Trader.LabourService.LabourServiceAgreement.LabourServiceAgreement_MakePayment, contractId as any, {})
  }

  return (
    <Container style={{ paddingTop: 10, paddingBottom: 10 }}>
      <Card fluid style={{ padding: 5 }}>
        <Card.Meta>
          <Grid>
            <Grid.Row>
              <Grid.Column width={5}>
                <Icon name='user' /> Owner: {users.owner}
              </Grid.Column>
              <Grid.Column width={5}>
                <Icon name='user' /> Provider: {users.provider}
              </Grid.Column>'
              <Grid.Column width={5}>
                Status: {payload.status}
              </Grid.Column>'
              <Grid.Column width={5}>
                <Icon name='money' /> Guarantee: ${payload.requirement.guarantee}
              </Grid.Column>
              <Grid.Column width={5}>
                <Icon name='money' /> Price: ${payload.price}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Meta>
        <Card.Content description={payload.requirement.description} />
        <Card.Content extra>
          {
            showFreezeFundsBtn && (<Button color='vk' onClick={handleFreezeFunds}>Freeze Funds</Button>)
          }
          {
            showWorkReadyBtn && (<Button color='vk' onClick={handleWorkReady}>Mark Work Done</Button>)
          }
          {
            showPassReviewButton && (<Button color='vk' onClick={handleReviewPassed}>Work Review Passed</Button>)
          }
          {
            showFinalPaymentButton && (<Button color='vk' onClick={handleFinalPayment}>Make Payment</Button>)
          }
        </Card.Content>
      </Card>
    </Container>
  )
}

export default AgreementItem;
