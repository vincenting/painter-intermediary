// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Trader } from '@daml.js/painter-intermediary';
import React, { useEffect, useState } from 'react';
import { Image, Menu } from 'semantic-ui-react';
import { PublicParty } from '../Credentials';
import { userContext } from './App';

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
    query$.on("live", (result) => {
      setBankBalance(result.map(({ payload: { balance } }) => balance)
        .reduce((a, b) => a + +b, 0))
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
    </>
  );
};

export default MainScreen;
