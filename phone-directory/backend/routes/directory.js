const express = require("express");
// const Module = require("module");
const User = require("../models/user");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

//map to validate incoming file types
const MIME_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

//multer configuration
const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      //validate file type
      const isValid = MIME_MAP[file.mimetype];

      //pass error to callback if invalid file
      let error = new Error("Invalid mime type");
      if (isValid) error = null
      cb(error, "images/");
    },
    filename: (req, file, cb) => {
      const name = file.originalname.toLowerCase().split(' ').join('-').split(".")[0];
      const ext = MIME_MAP[file.mimetype];

      //pass file name to callback (filename from client + timestamp)
      cb(null, name + "-" + Date.now() + "." + ext);
    }
  }
)

//accept user credential and check if present in db, return user if found
router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username, password: req.body.password }).then(response => {
    res.status(200).json({
      "message": "User logged in succesfully!",
      "users": response
    });
  }).catch( err => {
    res.status(400).json({"message": "User not found!"});
  });
});

//get all user contacts by id
router.get("/get/:id", (req, res, next) => {
  User.findOne({ "_id": req.params.id }).then(response => {
    res.status(200).json({
      "message": "User contacts found succesfully!",
      "contacts": response
    });
  }).catch( err => {
    res.status(400).json({"message": "No User found with this ID!"});
  });
});

//get single contact details by user id and contact id
//update total views and views by date for each hit to this api
router.get("/get-contact/:userid/:id", (req, res, next) => {
  let current_date = new Date().getDate() + "-" + new Date().getMonth();

  //find contact
  User.findOne({ "_id": req.params.userid }).select({ "contacts": { $elemMatch: { "_id": req.params.id } } }).then(resp => {

    let total = resp.contacts[0].total_views + 1;

    //if contact was not viewed today
    if (resp.contacts[0].views.filter(data => data["viewed_date"] == current_date).length == 0) {
      let obj = [{ viewed_date: current_date, frequency: 1 }]

      //add view for today
      User.updateOne({ "_id": req.params.userid, "contacts._id": req.params.id }, 
      { $push: { "contacts.$.views": obj }},
      { $set: { "contacts.$.total_views": total }
      }).then(response => {
        return res.status(200).json({
          "message": "Contact fetched from directory succesfully!",
          "contact": resp
        });
      }).catch( err => {
        res.status(400).json({"message": "Contact fetch failed!"});
      });
    }
    else {
      //if conntact was viewed today
      let freq = resp.contacts[0].views.filter(data => data["viewed_date"] == current_date)[0]["frequency"] + 1;

      //if views by date are 7, delete previous record and add todays view record and increment total views
      if (resp.contacts[0].views.length == 7) {
        User.updateOne({ "_id": req.params.userid, "contacts._id": req.params.id, "contacts.views.viewed_date": current_date },
          { $pop: { "contacts.views": -1 } },
          { $set: { "contacts.$[id].views.$[date].frequency": freq, "contacts.$[id].total_views": total } },
          { arrayFilters: [{ "id._id": req.params.id }, { "date.viewed_date": current_date }], multi: false }
        ).then(response => {
          return res.status(200).json({
            "message": "Contact fetched from directory succesfully!",
            "contact": resp
          });
        }).catch( err => {
          res.status(400).json({"message": "Contact fetch failed!"});
        });
      }
      else{
        //add todays view record and increment total views
        User.updateOne({ "_id": req.params.userid, "contacts._id": req.params.id, "contacts.views.viewed_date": current_date },
        { $set: { "contacts.$[id].views.$[date].frequency": freq, "contacts.$[id].total_views": total } },
        { arrayFilters: [{ "id._id": req.params.id }, { "date.viewed_date": current_date }], multi: false }
      ).then(response => {
        return res.status(200).json({
          "message": "Contact fetched from directory succesfully!",
          "contact": resp
        });
      }).catch( err => {
        res.status(400).json({"message": "Contact fetch failed!"});
      });
      }

    }
  }).catch( err => {
    res.status(400).json({"message": "No User/Contact found with this ID!"});
  });;
});

//update contact
router.put("/update-contact/:userid/:id", multer({ storage: storage }).single("photo"), (req, res, next) => {
  let reqBody = JSON.parse(req.body.data);

  //if file present, get url from multer, else get url from request body(formdata)
  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    reqBody["photoUrl"] = url + "/images/" + req.file.filename;
  }

  //update all fields
  User.updateOne({ "_id": req.params.userid, "contacts._id": req.params.id },
    {
      $set: {
        "contacts.$.first_name": reqBody.first_name, "contacts.$.last_name": reqBody.last_name,
        "contacts.$.middle_name": reqBody.middle_name, "contacts.$.mobile":reqBody.mobile,
        "contacts.$.landline": reqBody.landline, "contacts.$.email": reqBody.email,
        "contacts.$.notes": reqBody.notes, "contacts.$.date_edited": reqBody.date_edited,
        "contacts.$.photoUrl": reqBody.photoUrl
      }
    }).then(resp => {
      return res.status(200).json({
        "message": "Contact updated in directory succesfully!",
        "updatedPhotUrl": reqBody.photoUrl
      });
    }).catch( err => {
      res.status(400).json({"message": "Contact updating failed!"});
    });
});

//add contact
router.post("/add", multer({ storage: storage }).single("photo"), (req, res, next) => {
  let reqBody = JSON.parse(req.body.data);
  reqBody.contact["views"] = [];

  //if file present, get url from multer
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    reqBody.contact["photoUrl"] = url + "/images/" + req.file.filename;
  }

  //add contact to user with views as empty array
  User.updateOne({ "_id": reqBody.id }, { $push: { "contacts": reqBody.contact } }).then(resp => {
    return res.status(200).json({
      "message": "Contact added in directory succesfully!"
    });
  }).catch( err => {
    res.status(400).json({"message": "Contact add failed!"});
  });

});

//delete contact
router.delete("/delete-contact/:userid/:id", (req, res, next) => {
  User.updateOne({ "_id": req.params.userid }, { $pull: { "contacts": { "_id": req.params.id } } }).then(resp => {
    return res.status(200).json({
      "message": "Contact deleted from directory succesfully!"
    });
  }).catch( err => {
    res.status(400).json({"message": "Contact delete failed!"});
  });

});

module.exports = router;