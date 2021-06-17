import React from "react";

const Navbar = ({ account, setAccount }) => {

  const logout = async (e) => {
    e.preventDefault();
    window.web3 = "";
    setAccount('');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-5">
      <div className="container-fluid" style={{ maxWidth: 1400 }}>
        <p className="navbar-brand my-auto">Polygon PoS Bridge Withdraw</p>
        {account &&
          <div className="" id="navbarNavDarkDropdown">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <p className="nav-link dropdown-toggle my-auto" id="navbarDarkDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {truncateaccount(account)}
                </p>
                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDarkDropdownMenuLink">
                  <li><p className="dropdown-item my-auto">{account}</p></li>
                  <li><p className="dropdown-item my-auto" onClick={logout}>Log Out</p></li>
                </ul>
              </li>
            </ul>
          </div>
        }
      </div>
    </nav>
  );
};

export default Navbar;

const truncateaccount = (account) => {
  return account.slice(0, 7) + "..." + account.slice(-4);
};
