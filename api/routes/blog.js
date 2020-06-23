const express = require('express');
const router = express.Router();
const blog = require('../models/blog');
const mongoose = require('mongoose');

router.get('/page/:page', (req, res, next) => {
  const page = req.params.page;
  blog
    .find()
    .select('_id title body created lastUpdated imgUrl comment likes')
    .exec()
    .then((docs) => {
      docs.shift();
      docs = docs.reverse();
      const resp = {
        count: docs.length,
        blogs: docs.slice((page - 1) * 10, page * 10).map((doc) => {
          return {
            _id: doc._id,
            title: doc.title,
            body: doc.body.split(' ').splice(0, 150).join(' '),
            imgUrl: doc.imgUrl,
            created: doc.created,
            lastUpdated: doc.lastUpdated,
          };
        }),
      };
      if (docs.length > 0) res.status(200).json(resp);
      else res.status(404).json({ message: 'No Entries Found' });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/', (req, res, next) => {
  const Blog = new blog({
    _id: new mongoose.Types.ObjectId().toString(),
    title: req.body.title,
    created: new Date().toLocaleString(),
    body: req.body.body,
    imgUrl: req.body.imgUrl,
    comments: [],
    likes: 0,
    lastUpdated: '',
  });
  Blog.save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'New blog Created',
        blog: {
          _id: Blog._id,
          title: Blog.title,
          created: Blog.created,
          body: Blog.body,
          imgUrl: Blog.imgUrl,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
      });
    });
});
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  blog
    .findById(id)
    .exec()
    .then((doc) => {
      let likes = doc.likes;
      let comment = doc.comments;
      let comments = [];
      if (updateOps['likes']) {
        if (updateOps['likes'] == 1) likes += 1;
        else if (updateOps['likes'] == -1) likes -= 1;
      }
      if (updateOps['comments']) {
        if (updateOps['comments'].id) {
          for (let i = 0; i < comment.length; i++) {
            if (i != updateOps['comments'].id - 1) {
              comments.push(comment[i]);
            }
          }
        } else {
          comments = comment;
          comments.unshift(updateOps['comments'].value);
        }
      } else {
        comments = comment;
      }
      blog
        .update({ _id: id }, { likes, comments })
        .exec()
        .then((result) => {
          console.log(result);
          res.status(200).json({ message: 'entry updated' });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if (id == 'Login') {
    blog
      .findById(id)
      .exec()
      .then((doc) => {
        console.log(doc);
        res.status(200).json({ doc });
      });
  } else {
    blog
      .findById(id)
      .exec()
      .then((doc) => {
        if (doc) {
          console.log(doc);
          res.status(200).json({
            _id: doc._id,
            title: doc.title,
            body: doc.body,
            imgUrl: doc.imgUrl,
            created: doc.created,
            lastUpdated: doc.lastUpdated,
            likes: doc.likes,
            comments: doc.comments,
          });
        } else {
          res
            .status(404)
            .json({ message: 'No valid entry present for this id' });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  }
});
router.patch('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  if (req.body.length) {
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    updateOps['lastUpdated'] = new Date().toLocaleString();
    blog
      .update({ _id: id }, { $set: updateOps })
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json({ message: 'entry updated' });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  } else {
    res.status(500).json({ message: 'Enter the body in the specified format' });
  }
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  blog
    .remove({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: 'entry deleted' });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
