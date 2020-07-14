require("dotenv").config();

const   express         = require("express"),
        app             = express(),
        User            = require("./models/user"),
        flash           = require("connect-flash"),
        Comment         = require("./models/comment"),
        mongoose        = require("mongoose"),
        passport        = require("passport"),
        bodyParser      = require("body-parser"),
        Campground      = require("./models/campground"),
        LocalStrategy   = require("passport-local"),
        methodOverride  = require("method-override");

const   commentRoutes       = require("./routes/comments"),
        campgroundRoutes    = require("./routes/campgrounds"),
        authRoutes          = require("./routes/index");

// mongoose.connect("mongodb://localhost:27017/yelp_camp");
const uri = "mongodb+srv://yelpcamp:YelpcampIsAmazing@yelpcamp-dqdxk.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority"
mongoose.connect(process.env.MONGODB_URI || uri, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected");
}).catch(err => {
    console.log("Error: ", err.message);
});

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
// seedDB();   //Seed the Database

app.use(flash());
//Passport congfiguration
app.use(require("express-session")({
    secret: "Arnav is the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method")); 
app.locals.moment = require("moment");
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//The three methods used above come with passport-local-mongoose; we have not written it
//These three lines are necessary in configuring the passport module

app.use((req, res, next) => {       
    //This is our very own middleware.
    //This is so that we don't have to pass in currentUser manually on every route
    //app.use() is always called on all routes as we start the server 
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function(){
    console.log("The YelpCamp Server has started");
});