// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Trader } from '@daml.js/painter-intermediary';
import React, { useEffect, useState } from 'react';
import { Container, Image, Menu } from 'semantic-ui-react';
import { PublicParty } from '../Credentials';
import { userContext } from './App';
import RequirementForm from './RequirementForm';
import RequirementItem from './RequirementItem';

type Props = {
  onLogout: () => void;
  getPublicParty : () => PublicParty;
}

const MainScreen: React.FC<Props> = ({onLogout, getPublicParty}) => {
  const user = userContext.useUser();
  const party = userContext.useParty();

  const ledger = userContext.useLedger();

  const [bankBalance, setBankBalance] = useState<number | undefined>(); 

  useEffect(() => {
    const query$ = ledger.streamQueries(Trader.Account.Account, [{ username: user.primaryParty }])
    query$.on("change", (result) => {
      setBankBalance(result.map(({ payload: { balance } }) => balance)
        .reduce((a, b) => a + +b, 0))
    })

    return () => query$.close()
  }, [ledger, party, user.primaryParty]);

  const [requirements, setRequirements] = useState<any[]>([]); 

  useEffect(() => {
    const query$ = ledger.streamQueries(Trader.LabourService.LabourServiceRequirement, [])
    query$.on("change", (result) => {
      setRequirements(result as any)
    })

    return () => query$.close()
  }, [ledger, party, user.primaryParty]);

  return (
    <>
      <Menu icon borderless>
        <Menu.Item>
          <Image
            as='a'
            href='https://www.digitalasset.com/developers'
            target='_blank'
            src='/daml.svg'
            alt='Daml Logo'
            size='mini'
          />
        </Menu.Item>
        <Menu.Menu position='right' className='test-select-main-menu'>
          <Menu.Item position='right'>
            You are logged in as {user.userId}. Balance: {bankBalance}
          </Menu.Item>
          <Menu.Item
            position='right'
            active={false}
            className='test-select-log-out'
            onClick={onLogout}
            icon='log out'
          />
        </Menu.Menu>
      </Menu>
      <RequirementForm getPublicParty={getPublicParty}/>
      <Container textAlign='justified'>
        
        {
          requirements.map(({ contractId, payload }) => (
            <RequirementItem key={contractId} contractId={contractId} payload={payload} />
          ))
        }
      </Container>
    </>
  );
};

export default MainScreen;
