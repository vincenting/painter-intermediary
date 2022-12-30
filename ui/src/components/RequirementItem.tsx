import { Trader } from '@daml.js/painter-intermediary';
import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Grid, Icon, Input, List } from 'semantic-ui-react';
import { userContext } from './App';


type Props = {
  payload: Trader.LabourService.LabourServiceRequirement,
  contractId: string
}

const RequirementItem: React.FC<Props> = ({ payload, contractId }) => {
  const party = userContext.useParty();

  const ledger = userContext.useLedger();
  const [owner, setOwner] = useState('')

  useEffect(() => {
    ledger.getParties([payload.owner]).then(([party]) => {
      setOwner(party?.displayName || '')
    })
  }, [ledger, payload.owner]);

  const [quote, setQuote] = useState('')
  const [quotes, setQuotes] = useState<Trader.LabourService.LabourServiceQuote[]>([])


  const handleSubmitQuote = () => {
    ledger.exercise(Trader.LabourService.LabourServiceRequirement.Make_LabourServiceQuote, contractId as any, {
      provider: party,
      price: quote
    })
  }

  useEffect(() => {
    const query$ = ledger.streamQueries(Trader.LabourService.LabourServiceQuote, [{ requirementCid: contractId }])
    query$.on("change", (result) => {
      setQuotes(result.map(({ payload }) => payload))
    })

    return () => query$.close()
  }, [contractId, ledger, party]);

  return (
    <Container style={{ paddingTop: 10, paddingBottom: 10}}>
      <Card fluid style={{ padding: 5 }}>
        <Card.Meta>
          <Grid>
            <Grid.Row>
              <Grid.Column width={3}>
                <Icon name='user' /> Owner: {owner}
              </Grid.Column>
              <Grid.Column width={5}>
                <Icon name='money' /> Guarantee: ${payload.guarantee}
              </Grid.Column>
            </Grid.Row>
          </Grid>

        </Card.Meta>

        <Card.Content description={payload.description} />
        <Card.Content extra>
          <List divided relaxed>
            {
              quotes.map((q, idx) => (
                <List.Item key={idx}>
                  <List.Icon name='github' size='large' verticalAlign='middle' />
                  <List.Content>
                    <List.Header>Quote: ${q.labourAgreement.price}</List.Header>
                    <List.Description>Provider: ${q.provider}</List.Description>
                  </List.Content>
                </List.Item>
              ))
            }
            {
              party !== payload.owner && (
                <List.Item>
                  <List.Icon name='play' size='large' verticalAlign='middle' />
                  <List.Content>
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={5}>
                          <Input onChange={(e, { value }) => {
                            setQuote(value)
                          }} fluid placeholder='Provide your quote' />
                        </Grid.Column>
                        <Grid.Column width={5}>
                          <Button onClick={handleSubmitQuote} primary>Make Quote</Button>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </List.Content>
                </List.Item>
              )
            }
          </List>
        </Card.Content>
      </Card>
    </Container>
  )
}

export default RequirementItem;
