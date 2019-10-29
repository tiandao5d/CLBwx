import './login.css';
import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { login } from '../utils/utilsIndex'

class NormalLoginForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                login({
                    username: values.username,
                    password: values.password
                }).then(res => {
                    if (res.token) {
                        this.props.history.goBack();
                    }
                })
            }
        });
    };
    
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login-box">
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                            initialValue: ''
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                            initialValue: ''
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true
                        })(<Checkbox>Remember me</Checkbox>)}
                        <div className="login-form-forgot">Forgot password</div>
                        <Button type="primary" htmlType="submit" className="login-form-button">Log in</Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
export default WrappedNormalLoginForm;

// class LoginForm extends React.Component {
//     constructor () {
//         super();
//         this.state = {
//             username: '123',
//             password: ''
//         }
//     }
//     submit(e) {
//         e.stopPropagation();
//     }
//     render() {
//         return (
//             <div className="login-box">
//                 <form onSubmit={this.submit} className="login-form">
//                     <Input placeholder="username" value={this.state.username}/>
//                     <Input placeholder="password" type="password" value={this.state.password}/>
//                 </form>
//             </div>
//         )
//     }
// }

// export default LoginForm;