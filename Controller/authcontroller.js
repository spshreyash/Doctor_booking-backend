
const User=require("../model/user.js")
const Doctor=require("../model/Doctor.js")
const bcrypt=require("bcrypt")

const jwt=require("jsonwebtoken")
const genrateToken = require("../middleware/Jwt.js")

async function Signup(req,res){
 try {
      let user=null
      const{email,name,role,password,gender,photo,}=req.body
      if(role === "patient")
      {
        user=await User.findOne({email:email}) 
      }
      if(role === "Doctor")
      {
        user=await Doctor.findOne({email:email}) 
      }
      if(user)
      {
        return res.json({msg:"use alredy exists "})
      }

       const salt=await bcrypt.genSalt(10)
       const hashpass=await bcrypt.hash(password,salt)

       if(role === "patient")
       {
           user=await User.create({
            name:name,
             email:email,
             password:hashpass,
             photo:photo,
             gender:gender,
             role:role,
           })

       }

       if(role === "Doctor")
        {
            user=await Doctor.create({
              name:name,
              email:email,
              password:hashpass,
              photo:photo,
              gender:gender,
              role:role,
            })
 
        }

        let token=genrateToken(user)
        console.log(token)
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,        
          sameSite: 'None',
         
        });

        console.log(user)
        return res.send({msg:"user created Done !",user:user})

 } catch (error) {
    console.log(error)
    return res.send({msg:"server problem !"})
 }
} 

// async function Login(req,res) {
//     try {
//           let user=null
//           const{email,password}=req.body
//           const userp=await User.findOne({email:email})
//           const doctor=await Doctor.findOne({email:email})

//           if (userp) {
//             user = userp;
//           } else if (doctor) {
//             user = doctor;
//           }

//         if(!user)
//         {
//             return res.json({msg:"something wrong in email not found"})

//         }

//         const isMatch= await bcrypt.compare(password,user.password)
//         // console.log("this is pass",isMatch)
  
//          if(!isMatch)
//          {
//              return res.json({msg:"password wrong"})
//          }
//         const token=genrateToken(user)
//         res.cookie('token', token, {
//           httpOnly: true,
//             secure: true,        
//           sameSite: 'None',
         
//         });

//         console.log("this data is logging data ", user)
//         return res.json({msg:"logging Done ",user:user,token:token})


//     } catch (error) {
//         console.log(error)
        
//     }
// }

async function Login(req, res) {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }) || await Doctor.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Password is wrong"
      });
    }

    const token = genrateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      },
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
}

module.exports={
    Signup,Login
}
