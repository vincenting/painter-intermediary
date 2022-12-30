// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Trader } from '@daml.js/painter-intermediary';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, Form, Header } from "semantic-ui-react";
import { PublicParty } from '../Credentials';

import { userContext } from './App';
type Props = {
  getPublicParty: () => PublicParty;
}


const RequirementForm: React.FC<Props> = ({ getPublicParty }) => {
  const user = userContext.useUser();
  const party = userContext.useParty();

  const ledger = userContext.useLedger();

  const { usePublicParty, setup } = getPublicParty();
  const setupMemo = useCallback(setup, [setup]);
  useEffect(setupMemo);
  const publicParty = usePublicParty();

  const [banks, setBanks] = useState<{ displayName: string, identifier: string }[]>([]);

  useEffect(() => {
    const query$ = ledger.streamQueries(Trader.Account.Account, [{ username: user.primaryParty }])
    query$.on("live", async (result) => {
      const issuers = result.map(({ payload: { issuer } }) => issuer as string)
      setBanks(await ledger.getParties(issuers) as any)
    })

    return () => query$.close()
  }, [ledger, party, user.primaryParty]);

  const [formState, setFormState] = useState<{ guarantee?: string, description?: string, intermediary?: string }>({});

  const handleSubmit = async () => {
    await ledger.create(Trader.LabourService.LabourServiceRequirement, {
      owner: user.primaryParty as string,
      intermediary: formState.intermediary as string, 
      public: publicParty as string,
      guarantee: formState.guarantee as string,
      description: formState.description as string,
    })
  }

  return (
    <Container textAlign='justified'>
      <Header>Create your requirement</Header>
      <Form size="large" className="test-select-login-screen" onSubmit={handleSubmit}>
        <Form.Group widths='equal'>
          <Form.Input fluid label='Guarantee' onChange={(e, { value }) => {
            setFormState({ ...formState, guarantee: value })
          }} name="guarantee" placeholder='Guarantee cash from the labour' />
          <Form.Select
            fluid
            label='Intermediary'
            name="intermediary"
            onChange={(e, { value }) => {
              setFormState({ ...formState, intermediary: value as string })
            }}
            options={banks.map(({ displayName, identifier })=> ({ value: identifier, text: displayName || identifier }))}
            placeholder='Choose a bank as the Intermediary'
          />
        </Form.Group>
        <Form.TextArea label='Description' onChange={(e, { value }) => {
          setFormState({ ...formState, description: value as string })
        }} name='description' placeholder='Tell us more about the Requirement...' />
        <Button type='submit' color='facebook'>Submit Requirement</Button>
      </Form>
    </Container>
  );
};

export default RequirementForm;
