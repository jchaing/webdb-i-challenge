const express = require('express');

const db = require('../data/dbConfig');

const router = express.Router();

// GET all accounts
router.get('/', (req, res) => {
  db('accounts')
    .then(accounts => {
      res.status(200).json(accounts);
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: 'Could not retrieve list of accounts', err });
    });
});

// GET account by ID
router.get('/:id', validateAccountId, (req, res) => {
  res.status(200).json(req.account);
});

// POST new account {name, budget}
router.post('/', validateAccount, validateUniqueName, (req, res) => {
  const accountData = req.body;

  db('accounts')
    .insert(accountData)
    .then(account => {
      res.status(201).json(account);
    })
    .catch(err => {
      res.status(500).json({ message: 'Failed to post account', err });
    });
});

// PUT updating account {name, budget}
router.put(
  '/:id',
  validateAccountId,
  validateAccount,
  validateUniqueNameUpdate,
  (req, res) => {
    const { id } = req.params;

    db('accounts')
      .where('id', id)
      .update(req.body)
      .then(updated => {
        res.status(200).json({ updated: updated });
      })
      .catch(err => {
        res.status(500).json({ message: 'Unable to update account', err });
      });
  }
);

// DELETE account by ID
router.delete('/:id', validateAccountId, (req, res) => {
  const { id } = req.params;

  db('accounts')
    .where('id', id)
    .del()
    .then(deleted => {
      res.status(200).json({ deleted: deleted });
    })
    .catch(err => {
      res.status(500).json({ message: 'unable to delete account', err });
    });
});

/***** Middleware Validation *****/

function validateAccountId(req, res, next) {
  const { id } = req.params;

  db('accounts')
    .where('id', id)
    .then(account => {
      if (account.length > 0) {
        req.account = account;
        console.log('req.account', req.account);
        next();
      } else {
        res.status(400).json({ message: 'Invalid account ID' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Unable to get ID', err });
    });
}

function validateAccount(req, res, next) {
  const { name, budget } = req.body;

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: 'missing account data' });
  } else if (!name || !budget) {
    res.status(400).json({ message: 'missing name or budget field' });
  } else {
    next();
  }
}

function validateUniqueName(req, res, next) {
  const { name } = req.body;

  db('accounts')
    .where('name', name)
    .then(unique => {
      if (unique.length > 0) {
        res.status(400).json({
          message: 'Name is taken, please choose another name',
          unique
        });
      } else {
        next();
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Unable to check unique name', err });
    });
}

function validateUniqueNameUpdate(req, res, next) {
  const { name } = req.body;

  db('accounts')
    .where('name', name)
    .then(unique => {
      if (unique.length === 0 || unique[0].name === req.account[0].name) {
        next();
      } else {
        res
          .status(400)
          .json({ message: 'Name is taken, please choose another name' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Unable to validate unique name', err });
    });
}

module.exports = router;
