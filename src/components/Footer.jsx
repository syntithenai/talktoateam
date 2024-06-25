export default function Footer({icons}) {
    <>
        <span style={{position: 'fixed', bottom: 3, right:40,  height: '2em', width:'2em'}}  >
            <form action="https://www.paypal.com/donate" method="post" target="_new">
            <input type="hidden" name="hosted_button_id" value="3YUZQ4TGLEVCE" />
            <input type="image" style={{transform: 'rotate(20deg)', height:'30px', width:'25px'}} src="https://pics.paypal.com/00/s/OGVmNmM4NTQtMGQ0MS00NGVhLWI0NDgtNzMxYWRkMDY5NzIy/file.PNG" border="0" name="submit" title="Buy me a beer!" alt="Buy me a beer!" />
            <img alt="" border="0" src="https://www.paypal.com/en_AU/i/scr/pixel.gif" width="1" height="1" />
            </form>
        </span>

        <div style={{position: 'fixed', bottom: 0, right:0, backgroundColor: 'white', height: '3em', width:'3em'}} >
            <a target='new' href="https://github.com/syntithenai/talktoateam" style={{color:'black'}}  >{icons["github"]}</a>
        </div> 
    </>
}